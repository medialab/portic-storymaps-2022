#!/usr/bin/env python3

'''
Description: Get data from shared Google Drive documents to generate pages content
License: GPL-3.0-or-later
Author: Guillaume Brioudes (https://myllaume.fr/)
Date last modified: 2022-04-11
Python Version: 3.10.1
'''

import requests
from bs4 import BeautifulSoup
from html_sanitizer import Sanitizer
import html2markdown
import validators
import re
import csv
import json

sanitizer = Sanitizer({
    'tags': ('a', 'h1', 'h2', 'h3', 'strong', 'em', 'p', 'ul', 'ol', 'li', 'br', 'sub', 'sup', 'hr', 'caller'),
    'empty': ('hr', 'caller'),
    'attributes': { 'caller': ('id', 'class'), 'a': ('href', 'rel', 'target') }
})

GDOC_URL = {
    'fr': 'https://docs.google.com/document/d/e/2PACX-1vSaD-AW8-Zr-oq_tJzJDdQx3GlkjUQwwEQV_frnivUgmO5lLUBrbF0XW91b4M0SjNQeJ96ZobgXPMza/pub',
    'en': 'https://docs.google.com/document/d/e/2PACX-1vTF3c5EOop-BVFtcUZc0XJ7gabi-3cVlrQlskse3cBxOptjL1ecDaWWvKUecUKqYjF3r7jpt1k5YhTh/pub'
}
GSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQjllJXqWEPJ2cBWNNBAnKR4Kwt10LOR9AiLe4xyM5LNoC-c8y3AzNKJs4BtlEizuenQDFcYkoZvwJj/pub?gid=0&single=true&output=csv'

"""
Import visualisations list from GSheet
"""

viz_id_list = {}
inputs_csv_online = {}

with requests.Session() as s:
    download = s.get(GSHEET_URL)
    decoded_content = download.content.decode('utf-8')

    viz_id_list = {}

    reader = csv.DictReader(decoded_content.splitlines(), delimiter=',')
    for row in reader:
        row['n_chapitre'] = int(row['n_chapitre'])
        row['inputs'] = row['inputs'].split(',')
        row['outputs'] = row['outputs'].split(',')
        viz_id_list[ row['id'] ] = row

        for i, input_str in enumerate(row['inputs']):
            if validators.url(input_str) == True:
                try:
                    corresponding_output = row['outputs'][i]
                    inputs_csv_online[corresponding_output] = input_str
                except IndexError:
                    print('error : no output index for input online csv')

    json_object = json.dumps(viz_id_list, indent=4, ensure_ascii=False)
    with open('../src/data/viz.json', "w") as f:
        f.write(json_object)

"""
Import CSV from the web, from viz_id_list
"""

for output in inputs_csv_online.keys():
    input_url = inputs_csv_online[output]
    path = '../public/data/'
    with requests.Session() as s:
        online_csv = s.get(input_url)
        decoded_content = online_csv.content.decode('utf-8')
        f = open(path + output, "w")
        f.write(decoded_content)
        f.close()


"""
Import page content from GDoc
"""

for lang in GDOC_URL.keys():
    url = GDOC_URL[lang]
    parts = [[]]

    with requests.Session() as s:
        download = s.get(url)
        decoded_content = download.content.decode('utf-8')

        soup = BeautifulSoup(decoded_content, 'html.parser')
        title = soup.title.get_text()

        # Ignore and delete useless content
        soup = soup.find(id='contents')
        for styleTag in soup.select('style'):
            styleTag.extract()

        for link in soup.find_all('a'):
            # Google tracked link to clean link
            if link.has_attr('href') == False:
                continue
            link['href'] = re.search(r"q=(.*)&sa", link['href']).group(1)
            # Add attributes for safe navigation
            """
            link['target'] = '_blank'
            link['rel'] = 'noopener noreferrer'
            """

        content = soup.prettify() # Beautify HTML
        # Remove useless tags and attributes
        content = sanitizer.sanitize(content)
        # Unescape caller tags and their quotes
        content = re.sub(r"&lt;(.*?)&gt;", r"<\1>", content).replace('”', '"').replace('“', '"')

        # Second edition of HTML
        soup = BeautifulSoup(content, 'html.parser')

        # Each <caller> tag is extracted from its <p> parent
        for caller in soup.find_all('caller'):
            caller.parent.insert_after(caller)
            caller.parent.extract() # Delete <p>
        # Each <caller> tag without id is follow by a <div>
        for caller in soup.find_all('caller'):
            if caller.has_attr('id') == False:
                new_tag = BeautifulSoup('<div class="centered-part"></div>', 'html.parser')
                new_tag = new_tag.div
                caller.insert_after(new_tag)
                # Store each element is not a <h1> or another <caller> in the <div>
                """
                for next_tag in new_tag.find_all_next():
                    if next_tag.name not in {'h1', 'caller'}:
                        new_tag.append(next_tag)
                    else:
                        break
                """
                continue

        for title in soup.find_all('h1'):
            # Match <h1> to init a new part
            parts.append([title])
            for next_tag in title.find_all_next():
                if next_tag.name == 'h1':
                    # Begin a new part if new title
                    break
                # Store each brother tag in list
                parts[-1].append(next_tag)

        parts = parts[1:] # skip first empty part

        for i, part in enumerate(parts):
            # Make a new soup from each array of tags
            part = ''.join([str(tag) for tag in part])
            part_soup = BeautifulSoup(part, 'html.parser')
            for caller in part_soup.find_all('caller'):
                part_viz_id_list = [viz_id for viz_id in viz_id_list.keys() if viz_id_list[viz_id]['n_chapitre'] == i]
                if caller.has_attr('id') == False:
                    caller['class'] = 'is-blank'
                    continue
                caller['id'] = caller['id'].strip()
                if caller['id'] not in part_viz_id_list:
                    # <Caller> id is not find from viz id list
                    caller['class'] = 'is-invalid'
            part = part_soup.prettify()

            md = html2markdown.convert(part)
            # React requirements
            md = md.replace('caller', 'Caller')
            md = md.replace('class', 'className')

            f = open('../src/content/' + lang + '/part-' + str(i) + '.mdx', "w")
            f.write(md)
            f.close()