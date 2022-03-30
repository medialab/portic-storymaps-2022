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

GDOC_URL = 'https://docs.google.com/document/d/e/2PACX-1vTEis9-f44FkX5gSOfddxdqyYTi-HPKrNyuG5O2qtc2GBE8d6nMHSZGx8tCZ3ZfgAzs2N16OsKANbtm/pub'

parts = []

with requests.Session() as s:
    download = s.get(GDOC_URL)
    decoded_content = download.content.decode('utf-8')

    # Unescape tags
    decoded_content = re.sub(r"&lt;(.*?)/&gt;", r"<\1>", decoded_content).replace('”', '"').replace('“', '"')
    # Unescape quotes
    # decoded_content = (r"”|“", '"', decoded_content)

    soup = BeautifulSoup(decoded_content, 'html.parser')
    title = soup.title.get_text()

    # Ignore and delete useless content
    soup = soup.find(id='contents')
    for styleTag in soup.select('style'):
        styleTag.extract()

    # for toto in soup.find_all('h1'):
    #     print(toto)

    for caller in soup.find_all('caller'):
        if caller.has_attr('id') == False:
            # new_tag = BeautifulSoup('<div className="centered-part"></div>', 'html.parser')
            # new_tag = new_tag.div
            # caller.parent.append(new_tag)
            # print(new_tag)
            print(caller.parent)


    for link in soup.find_all('a'):
        # Google tracked link to clean link
        link['href'] = re.search(r"q=(.*)&sa", link['href']).group(1)
        # Add attributes for safe navigation
        link['target'] = '_blank'
        link['rel'] = 'noopener noreferrer'

    content = soup.prettify()

    content = sanitizer.sanitize(content)
    md = html2markdown.convert(content)

    f = open(title + '.mdx', "w")
    f.write(md)
    f.close()