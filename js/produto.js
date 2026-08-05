(function () {
  var products = {
    tracking: {
      name: 'Tracking server-side', category: 'Mensuração', commitment: 'Implementação orientada ao seu funil',
      title: 'Seu algoritmo só escala quando aprende com o sinal certo.',
      subtitle: 'Rastreamento server-side para registrar a jornada que realmente gera receita e devolver dados confiáveis para Meta, Google e o restante da sua stack.',
      for: ['Investe em mídia e não confia completamente na atribuição.', 'Tem conversões offline, checkout externo ou jornadas com mais de um canal.', 'Precisa relacionar investimento, lead, venda e receita no mesmo funil.'],
      notFor: ['Busca apenas instalar uma tag pontual.', 'Ainda não possui uma conversão ou operação que precise ser medida.', 'Quer substituir estratégia de mídia por uma ferramenta.'],
      deliverablesTitle: 'Uma base de mensuração pronta para decisão.',
      deliverables: [['Mapa de eventos', 'A jornada inteira traduzida em eventos úteis para o negócio e as plataformas.'], ['Servidor de tracking', 'Ambiente configurado para reduzir perda de sinal e manter o controle dos dados.'], ['Integrações de conversão', 'Meta, Google, CRM e fontes de venda conectados ao que realmente acontece.'], ['Validação e documentação', 'Testes, critérios de qualidade e uma leitura clara do que passa a ser medido.']],
      timeline: [['Diagnóstico', 'Mapeamos funil, fontes de dados e os pontos onde o sinal se perde.'], ['Implementação', 'Configuramos eventos, servidor e integrações com prioridade no que move receita.'], ['Validação', 'Conferimos a qualidade do dado e orientamos a operação para usar a nova leitura.']],
      ctaTitle: 'Faça seu investimento voltar a falar a verdade.'
    },
    infraestrutura: {
      name: 'Infraestrutura de performance', category: 'Arquitetura', commitment: 'Projeto desenhado a partir do diagnóstico',
      title: 'Antes de escalar a verba, faça a sua operação aguentar.',
      subtitle: 'Uma leitura completa de site, CRM, mídia, dados e processos para localizar o que trava resultado antes que o próximo real seja investido.',
      for: ['Tem canais e ferramentas que já funcionam, mas não funcionam juntos.', 'Sente que o crescimento revela novos gargalos toda semana.', 'Precisa de uma arquitetura capaz de acompanhar uma operação mais complexa.'],
      notFor: ['Procura um pacote de gestão de tráfego.', 'Quer uma recomendação rápida sem olhar o funil real.', 'Não pretende mexer em processos, dados ou tecnologia.'],
      deliverablesTitle: 'Uma operação desenhada para crescer sem gambiarra.',
      deliverables: [['Diagnóstico de stack', 'Leitura de site, CRM, mídia, dados e ferramentas que participam da conversão.'], ['Mapa de gargalos', 'Prioridades organizadas por impacto, dependência e risco operacional.'], ['Plano de arquitetura', 'Desenho de integrações, processos e indicadores que sustentam a próxima etapa.'], ['Acompanhamento executivo', 'Ritual de decisão para manter a execução conectada ao plano.']],
      timeline: [['Imersão', 'Entendemos a jornada, os times e o que hoje impede o sistema de responder.'], ['Desenho', 'Definimos arquitetura, prioridades e a sequência de implementação.'], ['Evolução', 'Apoiamos a execução e recalibramos a rota com a operação em movimento.']],
      ctaTitle: 'Descubra o que está entre sua verba e o resultado.'
    },
    jumperchat: {
      name: 'JumperChat e automações', category: 'Automação', commitment: 'Fluxos sob medida para a operação',
      title: 'Atendimento rápido sem transformar conversa em robô.',
      subtitle: 'Automação com IA aplicada ao fluxo de verdade: entender contexto, qualificar intenção, encaminhar bem e deixar o humano entrar no momento certo.',
      for: ['Recebe volume de conversas e perde velocidade no primeiro atendimento.', 'Precisa qualificar antes de enviar oportunidades para o time comercial.', 'Quer conectar atendimento, CRM, agenda e mensageria em uma única rotina.'],
      notFor: ['Quer um chatbot genérico com respostas prontas.', 'Não tem processo comercial ou de atendimento definido.', 'Busca automação sem acompanhar a experiência do cliente.'],
      deliverablesTitle: 'Um fluxo que responde, aprende e encaminha.',
      deliverables: [['Mapa de conversa', 'Intenções, exceções, perguntas e pontos em que o cliente precisa de um humano.'], ['Agente e base de conhecimento', 'Tom de voz, informações aprovadas e regras para uma resposta consistente.'], ['Integrações operacionais', 'CRM, agenda, mensageria e alertas ligados à jornada de atendimento.'], ['Métricas de qualidade', 'Visibilidade sobre volume, resolução, encaminhamento e oportunidades geradas.']],
      timeline: [['Desenho do fluxo', 'Mapeamos conversas reais, regras e o destino certo para cada intenção.'], ['Construção', 'Configuramos agente, integrações e rotas de exceção com sua equipe.'], ['Aprimoramento', 'Acompanhamos conversas e ajustamos o fluxo a partir do uso real.']],
      ctaTitle: 'Transforme conversa em continuidade, não em fila.'
    },
    desenvolvimento: {
      name: 'Desenvolvimento personalizado', category: 'Produto e tecnologia', commitment: 'Escopo, prazo e critérios antes de construir',
      title: 'Quando não existe uma ferramenta pronta, a gente constrói a certa.',
      subtitle: 'Portais, integrações e ferramentas próprias para operações que perderam tempo demais tentando adaptar processos importantes a soluções genéricas.',
      for: ['Tem um processo crítico preso em planilhas, retrabalho ou ferramentas desconectadas.', 'Precisa integrar plataformas que não conversam bem entre si.', 'Quer criar um ativo digital que continue fazendo sentido depois do lançamento.'],
      notFor: ['Quer uma entrega sem definir o problema que ela precisa resolver.', 'Precisa apenas de uma página institucional simples.', 'Procura software genérico sem adaptação ao negócio.'],
      deliverablesTitle: 'Produto construído em torno da sua operação.',
      deliverables: [['Descoberta de produto', 'Problema, usuários, decisões e recortes definidos antes do primeiro sprint.'], ['UX e interface', 'Fluxos e telas desenhados para a tarefa real, não para impressionar em apresentação.'], ['Desenvolvimento e integrações', 'Construção da aplicação e conexão com os sistemas que já fazem parte da rotina.'], ['Lançamento assistido', 'Critérios de qualidade, monitoramento e evolução orientada pelo uso.']],
      timeline: [['Descoberta', 'Definimos o problema, o primeiro recorte e como saberemos que ele funcionou.'], ['Construção', 'Desenhamos e entregamos em ciclos curtos, com visibilidade para quem decide.'], ['Lançamento', 'Publicamos, medimos o uso e priorizamos a próxima evolução com evidência.']],
      ctaTitle: 'Tire o processo crítico da planilha.'
    }
  };
  var key = new URLSearchParams(window.location.search).get('produto');
  var product = products[key] || products.infraestrutura;
  var all = Object.keys(products);
  function text(selector, value) { var el = document.querySelector(selector); if (el) el.textContent = value; }
  function list(selector, values) { var el = document.querySelector(selector); el.innerHTML = ''; values.forEach(function (value) { var item = document.createElement('li'); item.textContent = value; el.appendChild(item); }); }
  text('[data-product-category]', product.category); text('[data-product-title]', product.title); text('[data-product-subtitle]', product.subtitle); text('[data-product-commitment]', product.commitment); text('[data-product-deliverables-title]', product.deliverablesTitle); text('[data-product-cta-title]', product.ctaTitle); text('[data-product-cta-copy]', 'A conversa começa pelo seu contexto. Daí definimos se esta é a solução certa e qual deveria ser o primeiro movimento.');
  document.title = product.name + ' — Jumper Studio';
  document.querySelector('meta[name="description"]').setAttribute('content', product.subtitle);
  list('[data-product-for]', product.for); list('[data-product-not-for]', product.notFor);
  var deliverables = document.querySelector('[data-product-deliverables]');
  product.deliverables.forEach(function (entry) { var card = document.createElement('article'); card.className = 'entregavel'; card.innerHTML = '<h4></h4><p></p>'; card.querySelector('h4').textContent = entry[0]; card.querySelector('p').textContent = entry[1]; deliverables.appendChild(card); });
  var timeline = document.querySelector('[data-product-timeline]');
  product.timeline.forEach(function (entry, index) { var step = document.createElement('article'); step.className = 'crono-step'; step.innerHTML = '<span class="crono-week"></span><h4></h4><p></p>'; step.querySelector('.crono-week').textContent = '0' + (index + 1); step.querySelector('h4').textContent = entry[0]; step.querySelector('p').textContent = entry[1]; timeline.appendChild(step); });
  var switcher = document.querySelector('[data-product-switcher]');
  all.forEach(function (id) { var link = document.createElement('a'); link.href = 'produto.html?produto=' + id; link.textContent = products[id].name; if (id === key || (!key && id === 'infraestrutura')) link.className = 'is-active'; switcher.appendChild(link); });
}());
