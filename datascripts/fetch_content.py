import requests
from bs4 import BeautifulSoup
from html_sanitizer import Sanitizer
import html2markdown
import re

sanitizer = Sanitizer({
    'tags': ('a', 'h1', 'h2', 'h3', 'strong', 'em', 'p', 'ul', 'ol', 'li', 'br', 'sub', 'sup', 'hr', 'caller'),
    'empty': ('hr', 'caller'),
    'attributes': { 'caller': ('id'), 'a': ('href', 'rel', 'target') }
})

GDOC_URL = 'https://docs.google.com/document/d/e/2PACX-1vSaD-AW8-Zr-oq_tJzJDdQx3GlkjUQwwEQV_frnivUgmO5lLUBrbF0XW91b4M0SjNQeJ96ZobgXPMza/pub'

parts = [[]]

with requests.Session() as s:
    download = s.get(GDOC_URL)
    decoded_content = download.content.decode('utf-8')

    # Unescape tags and their quotes
    decoded_content = re.sub(r"&lt;(.*?)/&gt;", r"<\1>", decoded_content).replace('”', '"').replace('“', '"')

    soup = BeautifulSoup(decoded_content, 'html.parser')
    title = soup.title.get_text()

    # Ignore and delete useless content
    soup = soup.find(id='contents')
    for styleTag in soup.select('style'):
        styleTag.extract()

    for link in soup.find_all('a'):
        # Google tracked link to clean link
        link['href'] = re.search(r"q=(.*)&sa", link['href']).group(1)
        # Add attributes for safe navigation
        """
        link['target'] = '_blank'
        link['rel'] = 'noopener noreferrer'
        """

    content = soup.prettify() # Beautify HTML
    # Remove useless tags and attributes
    content = sanitizer.sanitize(content)

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

    content = soup.prettify()
    md = html2markdown.convert(content)

    md = md.replace('caller', 'Caller')

    # Analyse each Markdown line to find first level titles and split parts
    md_lines = md.split('\n')
    for line in md_lines:
        if line == '':
            pass
        if re.match(r"^#\s.*?$", line):
            # Match '# Title 1'
            parts.append([line])
        else:
            # Append other lines into the last part array
            parts[-1].append(line)

    # Each part became a MDX file
    for i, part in enumerate(parts):
        part = '\n'.join(part)
        f = open('../src/content/fr/partie-' + str(i) + '.mdx', "w")
        f.write(part)
        f.close()