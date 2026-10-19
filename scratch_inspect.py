import urllib.request, re

url = 'https://widgets.sociablekit.com/google-reviews/new/dist/widget.43327ebbcd.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    c = resp.read().decode('utf-8')

for m in re.finditer(r'--reviewer-name-color', c):
    pos = m.start()
    print('Match at', pos)
    print(c[max(0, pos-80):min(len(c), pos+100)])
