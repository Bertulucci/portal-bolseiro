/* Motor de pesquisa local do «Esclarecimento de Dúvidas».
   Configuração idêntica à testada (auditoria v2, 04/10/2026): não alterar sem novo teste.
   A pesquisa só encontra perguntas; as respostas são mostradas tal como constam da Matriz. */
(function (root) {
  var PALAVRAS_COMUNS = new Set('a o as os um uma uns umas de do da dos das em no na nos nas por para pelo pela pelos pelas com sem e ou mas se que qual quais quando como onde porque porquê já também só muito mais menos é são ser estar está estou foi fui tem tenho ter há posso pode podem devo deve preciso precisa quero queria eu me mim meu minha meus minhas seu sua lhe isso isto esse essa este esta ao aos à às sobre até após entre num numa nao não sim bolsa bolsas bolseiro bolseira bolseiros nova fct the a an of to in on at for with without and or but if is are be am i my me do does can could should must have has will would what when where how which who this that it as by from about any grant fellowship fellow nova fct'.split(' '));
  function normalizar(t) { return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function criarMotor(entradas, MiniSearch) {
    var indices = {};
    ['pt', 'en'].forEach(function (lang) {
      var ms = new MiniSearch({
        idField: 'id', fields: ['pergunta', 'formulacoes', 'termos', 'subtema'],
        tokenize: function (s) { return s.split(/[^\p{L}\p{N}]+/u); },
        processTerm: function (t) { var n = normalizar(t); return (n.length < 2 || PALAVRAS_COMUNS.has(n)) ? null : n; },
        searchOptions: {
          boost: { pergunta: 3, formulacoes: 2, termos: 2, subtema: 1 },
          fuzzy: function (t) { return t.length >= 5 ? 0.2 : false; },
          prefix: function (t) { return t.length >= 4; }, combineWith: 'OR'
        }
      });
      ms.addAll(entradas.map(function (e) {
        var x = e[lang];
        return { id: e.id, pergunta: x.q, formulacoes: x.f.join(' | '), termos: x.t.join(' '), subtema: lang === 'pt' ? e.subtema : '' };
      }));
      indices[lang] = ms;
    });
    return {
      pesquisar: function (texto, lang, n) {
        if (!texto || !texto.trim()) return [];
        return indices[lang].search(texto).slice(0, n || 4).map(function (r) { return r.id; });
      }
    };
  }
  root.criarMotorPesquisa = criarMotor;
  if (typeof module !== 'undefined') module.exports = criarMotor;
})(typeof window !== 'undefined' ? window : globalThis);
