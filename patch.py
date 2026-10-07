with open('src/lib/utils.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('submitted: "Yuborildi",', 'submitted: "Yuborildi",\n    edited: "Tahrirlandi",')
text = text.replace('submitted: "Submitted",', 'submitted: "Submitted",\n    edited: "Edited",')
text = text.replace('submitted: "bg-blue-100 text-blue-700 border-blue-200",', 'submitted: "bg-blue-100 text-blue-700 border-blue-200",\n  edited: "bg-purple-100 text-purple-700 border-purple-200",')

with open('src/lib/utils.ts', 'w', encoding='utf-8') as f:
    f.write(text)
