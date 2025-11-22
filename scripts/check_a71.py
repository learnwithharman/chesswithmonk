import json

with open('public/data/eco_index.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

a71 = data.get("A71", [])
print(f"A71 has {len(a71)} variations:")
for v in a71:
    print(f"- {v['name']}")
