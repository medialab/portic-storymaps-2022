#!/usr/bin/env python3

'''
Description: Get data from shared Google Drive documents to generate pages content, with quoting
License: GPL-3.0-or-later
Author: Guillaume Brioudes (https://myllaume.fr/)
Date last modified: 2022-04-11
Python Version: 3.10.1
'''

import re
import csv
import json
import requests
import os
from pathlib import Path
from urllib.parse import urlsplit, unquote, parse_qsl

from bs4 import BeautifulSoup
from html_sanitizer import Sanitizer
import validators
from pyzotero import zotero
from citeproc import CitationStylesStyle, CitationStylesBibliography
from citeproc import Citation, CitationItem
from citeproc import formatter
from citeproc.source.json import CiteProcJSON
from citeproc_styles import get_style_filepath

sanitizer = Sanitizer({
    'tags': ('a', 'h1', 'h2', 'h3', 'strong', 'em', 'p', 'ul', 'ol', 'li', 'br', 'hr', 'caller', 'link', 'dfn'),
    'empty': ('hr', 'caller'),
    'attributes': {
        'caller': ('id', 'class', 'year', 'object'),
        'a': ('href', 'rel', 'target', 'class', 'title'),
        'dfn': ('data-for', 'data-effect', 'data-tip'),
        'h2': ('id'), 'h3': ('id')
    }
})

# GDOC_URL = {
#     'fr': 'https://docs.google.com/document/d/e/2PACX-1vSaD-AW8-Zr-oq_tJzJDdQx3GlkjUQwwEQV_frnivUgmO5lLUBrbF0XW91b4M0SjNQeJ96ZobgXPMza/pub'
# }
GDOC_URL = {
    'fr': 'https://docs.google.com/document/d/e/2PACX-1vSaD-AW8-Zr-oq_tJzJDdQx3GlkjUQwwEQV_frnivUgmO5lLUBrbF0XW91b4M0SjNQeJ96ZobgXPMza/pub',
    'en': 'https://docs.google.com/document/d/e/2PACX-1vTF3c5EOop-BVFtcUZc0XJ7gabi-3cVlrQlskse3cBxOptjL1ecDaWWvKUecUKqYjF3r7jpt1k5YhTh/pub'
}
GSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQjllJXqWEPJ2cBWNNBAnKR4Kwt10LOR9AiLe4xyM5LNoC-c8y3AzNKJs4BtlEizuenQDFcYkoZvwJj/pub?gid=0&single=true&output=csv'

cols_to_markdown_file = {
    'original_data': 'What is the original data ?',
    'line_correspond_to': 'What does a line correspond to ?',
    'filters': 'Filters',
    'computation_info': 'Aggregation/computation info',
    'warnings': 'Notes/warnings'
}
doc_dir_path = '../doc/'

def warn(citation_item):
    return False

def set_humain_quote_id(item_metas):
    name = ''
    if 'editor' in item_metas:
        name = item_metas['editor'][0]['family']
    if 'author' in item_metas:
        name = item_metas['author'][0]['family']
    year = item_metas['issued']['date-parts'][0][0]
    year = str(year)
    if name != '' and year != '':
        return name + ',' + year
    else:
        return item_metas['id']

def make_markdown_from_viz_index(row):
    content = []
    for col in cols_to_markdown_file.keys():
        content.append('# ' + cols_to_markdown_file[col] + '\n\n')
        content.append(row[col] + '\n\n')
    return ''.join(content)

"""
Import visualisations list from GSheet
"""

viz_id_list = {}
inputs_csv_online = {}
bib_source = None
bib_style = CitationStylesStyle(get_style_filepath('iso690-author-date-fr-no-abstract'), validate=False)

with requests.Session() as s:
    print('Get viz list from GSheet')
    download = s.get(GSHEET_URL)
    decoded_content = download.content.decode('utf-8')

    viz_id_list = {}

    reader = csv.DictReader(decoded_content.splitlines(), delimiter=',')
    for row in reader:
        if row['statut'] == 'désactivé':
            continue
        del row['statut']
        row['n_chapitre'] = int(row['n_chapitre'])
        row['inputs'] = [] if row['inputs'] == '' else row['inputs'].split(',')
        row['outputs'] = [] if row['outputs'] == '' else row['outputs'].split(',')
        # Create Markdown file with infos
        if os.path.isdir(doc_dir_path + row['id']) == False:
            os.mkdir(doc_dir_path + row['id'])
        f = open(doc_dir_path + row['id'] + '/' + row['id'] + '.md', "w")
        f.write(make_markdown_from_viz_index(row))
        f.close()
        for col in cols_to_markdown_file.keys():
            del row[col]
        viz_id_list[ row['id'] ] = row
        print('--', row['id'])

        for i, input_str in enumerate(row['inputs']):
            if validators.url(input_str) == True:
                try:
                    corresponding_output = row['outputs'][i]
                except IndexError:
                    print('\033[91m','ERROR', '\033[0m', 'no output index for input online csv', input_str)
                inputs_csv_online[corresponding_output] = {
                    'input_str': input_str,
                    'id': row['id']
                }

    json_object = json.dumps(viz_id_list, indent=4, ensure_ascii=False)
    with open('../src/data/viz.json', "w") as f:
        f.write(json_object)

"""
Import CSV from the web, from viz_id_list
"""

print('Get online CSV list')
for output in inputs_csv_online.keys():
    output_extension = Path(output).suffix
    input_url = inputs_csv_online[output]['input_str']
    id = inputs_csv_online[output]['id']
    print('--', output)
    path = '../public/data/'
    with requests.Session() as s:
        online_csv = s.get(input_url)
        if output_extension == 'csv' and online_csv.headers['Content-Type'] != 'text/csv':
            print('\033[91m','ERROR', '\033[0m', 'is not a csv file')
            continue
        decoded_content = online_csv.content.decode('utf-8')
        f = open(path + output, "w")
        f.write(decoded_content)
        f.close()
        # Duplicate CSV in doc
        f = open(doc_dir_path + '/' + id + '/' + output, "w")
        f.write(decoded_content)
        f.close()

"""
Import CSL JSON from Zotero
"""

print('Get online CSL JSON from Zotero')
zotero_access = zotero.Zotero('4690289', 'group')
# print('--', zotero_access.count_items())
bib_database = zotero_access.items(format='csljson')
bib_database = bib_database['items']
for i, item_metas in enumerate(bib_database):
    bib_database[i]['id'] = set_humain_quote_id(item_metas)
    print('--', bib_database[i]['id'])
json_bib = json.dumps(bib_database, indent=4, ensure_ascii=False)
f = open('../src/data/bib.json', "w")
f.write(json_bib)
f.close()
bib_source = CiteProcJSON(bib_database)
bib_engine = CitationStylesBibliography(bib_style, bib_source, formatter.html)

"""
Import page content from GDoc
"""

print('Get online HTML content from GDoc')
for lang in GDOC_URL.keys():
    url = GDOC_URL[lang]
    parts_soup = []

    with requests.Session() as s:
        download = s.get(url)
        decoded_content = download.content.decode('utf-8')

        soup = BeautifulSoup(decoded_content, 'html.parser')
        title = soup.title.get_text()

        # Ignore and delete useless content
        soup = soup.find(id='contents')
        for styleTag in soup.select('style'):
            styleTag.extract()

        titles_per_part = {}
        title_part_number = -1 # because the first title have to be 0
        for title in soup.find_all({'h1', 'h2', 'h3'}):
            title_id = title['id']
            if title.name == 'h1':
                title_part_number += 1
            titles_per_part[title_id] = {
                'part': title_part_number,
                'name': title.name
            }

        for link in soup.find_all('a'):
            if link.has_attr('href') == False:
                continue

            re_match_footnote_anchor = re.match(r"#ftnt(?P<id>[0-9]+)", link['href'])
            re_match_footnote_ref = re.match(r"#ftnt_ref(?P<id>[0-9]+)", link['href'])
            if re_match_footnote_ref:
                footnote_id = re_match_footnote_ref.groupdict()['id']
                footnote_ref = link
                footnote_text_container = footnote_ref.find_next('span')
                footnote_text = ''.join([text.string for text in footnote_text_container.parent.find_all('span')])
                footnote_text = footnote_text.replace('“', '«').replace('”', '»')
                footnote_anchor = soup.find('a', {'href': str('#ftnt' + footnote_id)})
                footnote_anchor_context = footnote_anchor.parent.find_previous().string
                # footnote_anchor_text = footnote_anchor_context.split()[-1]
                footnote_anchor.string.replace_with(' (?)')
                footnote_anchor.name = 'dfn'
                del footnote_anchor['id']; del footnote_anchor['href']
                footnote_anchor['data-for'] = 'contents-tooltip'
                footnote_anchor['data-effect'] = 'solid'
                footnote_anchor['data-tip'] = footnote_text
                # delete tags
                footnote_ref.extract()
                footnote_text_container.extract()
                continue
            if re_match_footnote_anchor:
                continue

            re_match_title_link = re.match(r"#h(?P<id>.*)", link['href'])
            if re_match_title_link:
                title_id = 'h' + re_match_title_link.groupdict()['id']
                title_name = titles_per_part[title_id]['name']
                title_part = str(titles_per_part[title_id]['part'])
                title_element = soup.find(title_name, {'id': title_id})
                href = '/' + lang + '/partie-' + title_part
                if title_element.name != 'h1':
                    href += '#' + title_id
                link['class'] = 'title_link'
                link['href'] = href
                continue

            # Track Google links to clean them
            link['href'] = re.search(r"(?<=q=)(.*?)(?=&)", link['href']).group(1)

            parse = urlsplit(link['href'])
            if parse.netloc == 'caller':
                query = unquote(parse.query)
                query = dict(parse_qsl(query))
                link.name = 'caller'
                # if id not in query:
                #     continue
                # link['id'] = query['id']
                for key in query.keys():
                    link[key] = query[key]
                # link['id'] = 'dunkerque-courses'

            # Add attributes for safe navigation
            """
            link['target'] = '_blank'
            link['rel'] = 'noopener noreferrer'
            """

        content = str(soup)
        # Remove useless tags and attributes
        content = sanitizer.sanitize(content)
        # Unescape caller tags and their quotes
        content = re.sub(r"&lt;(.*?)&gt;", r"<\1>", content).replace('”', '"').replace('“', '"')

        # Second edition of HTML
        soup = BeautifulSoup(content, 'html.parser')

        # Each <caller> tag without id is follow by a <div>
        for caller in soup.find_all('caller'):
            """
            if caller.has_attr('id') == False:
                new_tag = BeautifulSoup('<div class="centered-part"></div>', 'html.parser')
                new_tag = new_tag.div
                caller.insert_after(new_tag)
                # Store each element is not a <h1> or another <caller> in the <div>
                for next_tag in new_tag.find_all_next():
                    if next_tag.name not in {'h1', 'caller'}:
                        new_tag.append(next_tag)
                    else:
                        break
                continue
            """
            is_inline_caller = len(caller.parent.find_all()) == 1
            if is_inline_caller == False:
                caller['class'] = 'is-inblock'
            """
            else:
                # <caller> tag is extracted from its <p> parent
                caller.parent.insert_after(caller)
                caller.parent.extract() # Delete <p>
            """

        for i, title in enumerate(soup.find_all('h1')):
            part_soup = BeautifulSoup('<div id="part-' + str(i) + '"/>', 'html.parser')
            part_root = part_soup.div
            for next_tag in title.find_all_next():
                if next_tag.name == 'h1':
                    break
                if next_tag.name not in {'p', 'h1', 'h2', 'h3'}:
                    continue
                part_root.append(next_tag)
            parts_soup.append(part_soup)

        for part_nb, part_soup in enumerate(parts_soup):
            bibliography_spans = {}
            citations_spans = {}
            for title_link in part_soup.find_all('a', {'class': 'title_link'}):
                title_link.name = 'link'
                title_link['to'] = title_link['href']
                del title_link['href']
            for caller in part_soup.find_all('caller'):
                part_viz_id_list = [viz_id for viz_id in viz_id_list.keys() if viz_id_list[viz_id]['n_chapitre'] == part_nb]
                if caller.has_attr('id') == False:
                    caller['class'] = 'is-blank'
                    continue
                caller['id'] = caller['id'].strip()
                if caller['id'] not in part_viz_id_list:
                    # <Caller> id is not find from viz id list
                    caller['class'] = 'is-invalid'
            part = str(part_soup)
            # Quoting
            matches = re.finditer(r"\[@.*?\]", part, re.MULTILINE)
            for i, match in enumerate(matches):
                match = match.group()
                match_split = match.split(';')
                citation_group = [re.sub(r"[@\s\[\]]", '', match) for match in match_split]
                citation_group = [CitationItem(citation) for citation in citation_group if citation]
                citations_spans[match] = citation_group
            for citation_match in citations_spans.keys():
                citation_group = Citation(citations_spans[citation_match])
                bib_engine.register(citation_group)
                citations_spans[citation_match] = bib_engine.cite(citation_group, warn)
                part = part.replace(citation_match, citations_spans[citation_match])
            # Add bibliography for the part
            for item in bib_engine.bibliography():
                bibliography_item_key = item.split(',', 1)[0]
                bibliography_span = BeautifulSoup('<li>' + str(item) + '</li>', 'html.parser')
                bibliography_spans[bibliography_item_key] = bibliography_span
            bibliography_spans_sorted = {k: bibliography_spans[k] for k in sorted(bibliography_spans)}
            part_soup = BeautifulSoup(part, 'html.parser')
            bib_container_soup = BeautifulSoup('<div class="bibliography"><h2>Bibliographie</h2></div>', 'html.parser')
            for bib_soup in bibliography_spans_sorted.values():
                bib_container_soup.div.append(bib_soup)
            part_soup.div.append(bib_container_soup)
            part = str(part_soup)

            # React requirements
            part = re.sub(r"(</?)caller", r"\1Caller", part) # caller -> Caller
            part = re.sub(r"(</?)link", r"\1Link", part) # link -> Laller
            part = re.sub(r"class(=\")", r"className\1", part) # class -> className

            """
            f = open('./' + lang + '-part-' + str(i) + '.html', "w")
            f.write(part)
            f.close()
            """

            f = open('../src/content/' + lang + '/part-' + str(part_nb) + '.mdx', "w")
            f.write(part)
            f.close()
            print('-- part', lang, part_nb)