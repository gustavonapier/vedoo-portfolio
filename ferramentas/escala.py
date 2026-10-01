"""Gera assets/escala-desktop.css: repete, só no desktop, todas as declarações com px
multiplicadas por FATOR — o mesmo efeito de ver o site com o zoom do navegador em 95%.
A prancha da mesa (janelas e cursores) fica de fora, porque ela já escala sozinha pela tela."""
import re, sys, tinycss2
FATOR = 0.95
import pathlib
SITE = sys.argv[1] if len(sys.argv) > 1 else str(pathlib.Path(__file__).resolve().parent.parent)
FONTES = ['styles.css', 'assets/destaque-unbounded.css']
PULAR = re.compile(r'\.win\b|\.win_|\.win-|\.cur\b|\.cur-|\.mesa__board|\.mesa__deck')

PREFIXO = ''  # caminho do arquivo de origem em relação a assets/ (o url() muda de pasta)

def ajusta_url(u):
    if re.match(r'^(data:|https?:|/|#)', u): return u
    return PREFIXO + u

def escala_px(tokens):
    out, mudou = [], False
    for t in tokens:
        if t.type == 'url':
            out.append(f'url("{ajusta_url(t.value)}")'); continue
        if t.type == 'function' and t.name.lower() == 'url':
            strs = [a for a in t.arguments if a.type == 'string']
            if strs:
                out.append(f'url("{ajusta_url(strs[0].value)}")'); continue
        if t.type == 'dimension' and t.unit.lower() == 'px' and abs(t.value) > 1.5:
            v = round(t.value * FATOR, 2)
            out.append(f"{v:g}px"); mudou = True
        elif t.type == 'function':
            inner, m = escala_px(t.arguments); mudou |= m
            out.append(f"{t.name}({inner})")
        elif t.type in ('() block', '[] block', '{} block'):
            inner, m = escala_px(t.content); mudou |= m
            o, c = {'() block': '()', '[] block': '[]', '{} block': '{}'}[t.type]
            out.append(f"{o}{inner}{c}")
        else:
            out.append(tinycss2.serialize([t]))
    return ''.join(out), mudou

def serial_prancha(tokens):
    global FATOR
    f, FATOR = FATOR, 1.0
    try: return escala_px(tokens)[0]
    finally: FATOR = f

def regra(rule):
    global PREFIXO
    sel = tinycss2.serialize(rule.prelude).strip()
    prancha = bool(PULAR.search(sel))  # repete sem escalar, só pra manter a ordem da cascata
    decls = tinycss2.parse_declaration_list(rule.content, skip_whitespace=True, skip_comments=True)
    linhas = []
    for d in decls:
        if d.type != 'declaration': continue
        val, mudou = escala_px(d.value) if not prancha else (serial_prancha(d.value), False)
        if True:
            linhas.append(f"{d.name}: {val.strip()}{' !important' if d.important else ''};")
    return f"{sel} {{ {' '.join(linhas)} }}\n" if linhas else ''

def nunca_no_desktop(prelude):
    m = re.search(r'max-width:\s*(\d+)px', prelude)
    return bool(m and int(m.group(1)) <= 760)

def bloco(rules, nivel=1):
    out = []
    for r in rules:
        if r.type == 'qualified-rule':
            out.append(regra(r))
        elif r.type == 'at-rule' and r.lower_at_keyword == 'media':
            pre = tinycss2.serialize(r.prelude).strip()
            if nunca_no_desktop(pre): continue
            inner = bloco(tinycss2.parse_rule_list(r.content, skip_whitespace=True, skip_comments=True), nivel + 1)
            if inner.strip(): out.append(f"@media {pre} {{\n{inner}}}\n")
    return ''.join(out)

corpo = ''
for f in FONTES:
    PREFIXO = '' if f.startswith('assets/') else '../'
    css = open(f"{SITE}/{f}", encoding='utf-8').read()
    corpo += f"/* de {f} */\n" + bloco(tinycss2.parse_stylesheet(css, skip_whitespace=True, skip_comments=True))

cab = f"""/*
  Escala do desktop: o site em 100% fica do tamanho que tinha em {int(FATOR*100)}% de zoom.
  Arquivo GERADO a partir de styles.css e destaque-unbounded.css: repete as regras na mesma ordem
  (pra cascata continuar igual), com px × {FATOR}, só a partir de 761px. A prancha da mesa não muda.
  Pra voltar ao tamanho anterior, é só apagar a linha que carrega este arquivo no <head> das páginas.
*/
"""
open(f"{SITE}/assets/escala-desktop.css", 'w', encoding='utf-8', newline='\n').write(cab + "@media (min-width: 761px) {\n" + corpo + "}\n")
print('ok', len(corpo.splitlines()), 'linhas')
