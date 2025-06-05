const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Configurar dotenv para carregar o arquivo .env do diretório correto
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta 'public' - deve vir antes das rotas
app.use(express.static(path.join(__dirname, 'public')));

// Rota específica para servir o index.html na raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Usando apenas Google AI Studio (Gemini)

// Sistema de Aprendizado Personalizado
let modoTreinamento = false;
let aguardandoResposta = null;
let conhecimentoPersonalizado = new Map();

// Carregar conhecimento salvo (simulado - em produção usaria banco de dados)
function carregarConhecimento() {
  // Aqui você pode carregar de um arquivo JSON ou banco de dados
  // Por enquanto, vamos usar alguns exemplos
  conhecimentoPersonalizado.set('qual é o seu nome', 'Meu nome é Assistente IA personalizado!');
  conhecimentoPersonalizado.set('quem criou você', 'Fui criado por você durante nosso treinamento!');
}

// Inicializar conhecimento
carregarConhecimento();

// Rota de pergunta
app.post('/api/perguntar', async (req, res) => {
  const { pergunta } = req.body;

  if (!pergunta) {
    return res.status(400).json({ erro: 'Pergunta não fornecida.' });
  }

  // Verificar comandos especiais de treinamento
  const perguntaLower = pergunta.toLowerCase().trim();

  // Comando para ativar modo treinamento
  if (perguntaLower === '/treinar' || perguntaLower === '/modo treino') {
    modoTreinamento = true;
    aguardandoResposta = null;
    const resposta = "MODO DE TREINAMENTO ATIVADO! Agora voce pode me ensinar! Funciona assim: 1. Faca uma pergunta 2. Eu vou perguntar como devo responder 3. Voce me ensina a resposta 4. Eu vou lembrar para sempre! Comandos: /sair - Sair do modo treinamento, /listar - Ver o que aprendi, /esquecer [pergunta] - Esquecer algo especifico. Faca sua primeira pergunta para me ensinar!";
    res.json({ resposta });
    return;
  }

  // Comando para sair do modo treinamento
  if (perguntaLower === '/sair' && modoTreinamento) {
    modoTreinamento = false;
    aguardandoResposta = null;
    const resposta = "MODO DE TREINAMENTO DESATIVADO! Voltei ao modo normal. Agora vou usar tudo que voce me ensinou junto com minha IA!";
    res.json({ resposta });
    return;
  }

  // Comando para listar conhecimento
  if (perguntaLower === '/listar') {
    let resposta;
    if (conhecimentoPersonalizado.size === 0) {
      resposta = "Ainda nao aprendi nada especifico com voce. Use /treinar para me ensinar!";
    } else {
      let lista = "CONHECIMENTO QUE APRENDI COM VOCE: ";
      let contador = 1;
      for (let [perguntaItem, respostaItem] of conhecimentoPersonalizado) {
        lista += contador + ". P: " + perguntaItem + " - R: " + respostaItem.substring(0, 100) + (respostaItem.length > 100 ? "..." : "") + " ";
        contador++;
      }
      resposta = lista;
    }
    res.json({ resposta });
    return;
  }

  // Comando para esquecer
  if (perguntaLower.startsWith('/esquecer ')) {
    const perguntaParaEsquecer = perguntaLower.replace('/esquecer ', '').trim();
    let resposta;
    if (conhecimentoPersonalizado.has(perguntaParaEsquecer)) {
      conhecimentoPersonalizado.delete(perguntaParaEsquecer);
      resposta = "Esqueci a pergunta: " + perguntaParaEsquecer;
    } else {
      resposta = "Nao encontrei essa pergunta no meu conhecimento: " + perguntaParaEsquecer;
    }
    res.json({ resposta });
    return;
  }

  // Lógica do modo treinamento
  if (modoTreinamento) {
    if (aguardandoResposta === null) {
      // Primeira mensagem - guardar a pergunta e pedir a resposta
      aguardandoResposta = perguntaLower;
      const resposta = "Entendi! Voce quer me ensinar sobre: " + pergunta + ". Agora me diga: como devo responder a essa pergunta? Sua proxima mensagem sera a resposta que vou aprender.";
      res.json({ resposta });
      return;
    } else {
      // Segunda mensagem - salvar a resposta
      conhecimentoPersonalizado.set(aguardandoResposta, pergunta);
      const resposta = "Aprendi! Pergunta: " + aguardandoResposta + " - Resposta: " + pergunta + ". Agora sei responder isso! Faca outra pergunta para me ensinar mais, ou digite /sair para voltar ao modo normal.";
      aguardandoResposta = null;
      res.json({ resposta });
      return;
    }
  }

  // Verificar se tenho conhecimento personalizado sobre esta pergunta
  const perguntaNormalizada = perguntaLower.replace(/[?!.]/g, '').trim();
  for (let [perguntaAprendida, respostaAprendida] of conhecimentoPersonalizado) {
    if (perguntaNormalizada.includes(perguntaAprendida) || perguntaAprendida.includes(perguntaNormalizada)) {
      console.log(`[CONHECIMENTO PERSONALIZADO] Encontrei resposta para: "${pergunta}"`);
      res.json({ resposta: "CONHECIMENTO APRENDIDO: " + respostaAprendida });
      return;
    }
  }

  // Usar Google AI Studio (Gemini) - API gratuita e confiável
  const googleKey = process.env.GOOGLE_AI_KEY || 'AIzaSyCOHwQQDF0NmD1wSJIM9coDCnCMexsw57I';
  console.log(`[DEBUG] Google Key: ${googleKey ? 'Configurada' : 'Não encontrada'}`);
  console.log(`[DEBUG] Primeira parte da chave: ${googleKey ? googleKey.substring(0, 10) + '...' : 'N/A'}`);

  if (googleKey && googleKey !== 'SEU_TOKEN_GOOGLE_AQUI') {
    try {
      console.log(`[GOOGLE GEMINI] Processando pergunta: "${pergunta}"`);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: pergunta
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        let resposta = data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui gerar uma resposta.";

        resposta = resposta.trim();

        if (resposta.length > 5) {
          console.log(`[GOOGLE GEMINI] Resposta: "${resposta}"`);
          res.json({ resposta });
          return;
        }
      } else {
        const errorText = await response.text();
        console.log('Google AI retornou erro:', response.status, errorText);
      }
    } catch (error) {
      console.log('Erro na Google AI API:', error.message);
    }
  }

  // Sistema de IA simulada inteligente - Fallback gratuito
  console.log(`[IA FALLBACK] Processando pergunta: "${pergunta}"`);

  // Simula tempo de processamento realista
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));



  // Sistema de IA Avançado com Respostas Contextuais e Inteligentes (Fallback)
  let resposta;

  // Saudações e cumprimentos
  if (perguntaLower.includes('olá') || perguntaLower.includes('oi') || perguntaLower.includes('hello') ||
      perguntaLower.includes('bom dia') || perguntaLower.includes('boa tarde') || perguntaLower.includes('boa noite') ||
      perguntaLower.includes('hey') || perguntaLower.includes('e aí')) {
    const saudacoes = [
      "Olá! Prazer em conversar com você. Como posso ajudar hoje?",
      "Oi! Que bom falar com você. Em que posso ser útil?",
      "Olá! Estou aqui para ajudar. O que você gostaria de saber?",
      "Oi! Como você está? Posso ajudar com alguma coisa?",
      "Hey! Bem-vindo! Como posso te ajudar hoje?",
      "Olá! É um prazer conversar com você. O que você tem em mente?"
    ];
    resposta = saudacoes[Math.floor(Math.random() * saudacoes.length)];

  // Como está
  } else if (perguntaLower.includes('como') && (perguntaLower.includes('está') || perguntaLower.includes('vai'))) {
    resposta = "Estou muito bem, obrigado por perguntar! Funcionando perfeitamente e pronto para ajudar. Como você está?";

  // Nome
  } else if (perguntaLower.includes('nome') || perguntaLower.includes('chama')) {
    resposta = "Sou uma IA assistente criada para ajudar e conversar. Você pode me chamar apenas de Assistente. Qual é o seu nome?";

  // Idade
  } else if (perguntaLower.includes('idade') || perguntaLower.includes('anos')) {
    resposta = "Como IA, não tenho idade no sentido tradicional. Fui criado recentemente para ajudar com conversas e responder perguntas!";

  // Ajuda
  } else if (perguntaLower.includes('ajuda') || perguntaLower.includes('help') || perguntaLower.includes('pode') && perguntaLower.includes('fazer')) {
    resposta = "Claro! Posso ajudar com: conversas gerais, cálculos matemáticos, responder perguntas, dar sugestões e muito mais. O que você precisa?";

  // Agradecimentos
  } else if (perguntaLower.includes('obrigad') || perguntaLower.includes('valeu') || perguntaLower.includes('thanks')) {
    resposta = "De nada! Fico muito feliz em ajudar. Se precisar de mais alguma coisa, é só perguntar!";

  // Matemática
  } else if (perguntaLower.match(/\d+\s*[\+\-\*\/]\s*\d+/) || perguntaLower.includes('calcul') || perguntaLower.includes('quanto é')) {
    try {
      const operacao = pergunta.match(/\d+\s*[\+\-\*\/]\s*\d+/);
      if (operacao) {
        const resultado = eval(operacao[0]);
        resposta = `O resultado de ${operacao[0]} é ${resultado}. Posso ajudar com mais algum cálculo?`;
      } else {
        resposta = "Posso ajudar com cálculos! Tente escrever a operação de forma clara, como '2 + 2' ou '10 * 5'.";
      }
    } catch {
      resposta = "Posso ajudar com cálculos! Tente escrever a operação de forma mais clara, como '2 + 2'.";
    }

  // Perguntas sobre o que é
  } else if (perguntaLower.includes('o que é') || perguntaLower.includes('que é')) {
    resposta = "Essa é uma ótima pergunta! Embora eu seja uma IA com conhecimento limitado, posso tentar ajudar. Pode ser mais específico sobre o que você quer saber?";

  // Como fazer
  } else if (perguntaLower.includes('como fazer') || perguntaLower.includes('como') && perguntaLower.includes('fazer')) {
    resposta = "Interessante! Gostaria de ajudar você a descobrir como fazer isso. Pode me dar mais detalhes sobre o que você quer aprender?";

  // Despedidas
  } else if (perguntaLower.includes('tchau') || perguntaLower.includes('bye') || perguntaLower.includes('até logo') || perguntaLower.includes('adeus')) {
    resposta = "Tchau! Foi um prazer conversar com você. Volte sempre que precisar de ajuda!";

  // Perguntas existenciais
  } else if (perguntaLower.includes('você é') || perguntaLower.includes('quem é você')) {
    resposta = "Sou uma IA assistente criada para conversar e ajudar pessoas. Gosto de responder perguntas e ter conversas interessantes!";

  // Perguntas sobre tecnologia
  } else if (perguntaLower.includes('programação') || perguntaLower.includes('código') || perguntaLower.includes('javascript') ||
             perguntaLower.includes('python') || perguntaLower.includes('tecnologia') || perguntaLower.includes('computador')) {
    const respostasTech = [
      "Tecnologia é fascinante! Embora eu seja uma IA simples, posso conversar sobre programação e desenvolvimento. O que você gostaria de saber?",
      "Programação é uma área incrível! Você está aprendendo alguma linguagem específica?",
      "Que legal que você se interessa por tecnologia! Posso ajudar com conceitos básicos. Qual é sua dúvida?",
      "Desenvolvimento de software é um campo muito dinâmico. Em que posso ajudar?"
    ];
    resposta = respostasTech[Math.floor(Math.random() * respostasTech.length)];

  // Perguntas sobre tempo/clima
  } else if (perguntaLower.includes('tempo') || perguntaLower.includes('clima') || perguntaLower.includes('chuva') || perguntaLower.includes('sol')) {
    resposta = "Infelizmente não tenho acesso a informações meteorológicas em tempo real, mas espero que você tenha um ótimo dia independente do clima!";

  // Perguntas sobre localização
  } else if (perguntaLower.includes('onde') && (perguntaLower.includes('fica') || perguntaLower.includes('está'))) {
    resposta = "Não tenho acesso a informações de localização em tempo real, mas posso tentar ajudar com informações gerais se você for mais específico!";

  // Perguntas sobre sentimentos/emoções
  } else if (perguntaLower.includes('triste') || perguntaLower.includes('feliz') || perguntaLower.includes('ansioso') ||
             perguntaLower.includes('preocupado') || perguntaLower.includes('estressado')) {
    const respostasEmocionais = [
      "Entendo que você pode estar passando por um momento difícil. Embora eu seja apenas uma IA, estou aqui para conversar se isso ajudar.",
      "Sentimentos são importantes e válidos. Quer conversar sobre o que está acontecendo?",
      "Às vezes conversar pode ajudar. Estou aqui para ouvir, mesmo sendo uma IA simples.",
      "Espero que você se sinta melhor em breve. Há algo específico que posso fazer para ajudar?"
    ];
    resposta = respostasEmocionais[Math.floor(Math.random() * respostasEmocionais.length)];

  // Perguntas sobre hobbies/interesses
  } else if (perguntaLower.includes('gosta') || perguntaLower.includes('hobby') || perguntaLower.includes('filme') ||
             perguntaLower.includes('música') || perguntaLower.includes('livro') || perguntaLower.includes('jogo')) {
    const respostasHobbies = [
      "Que interessante! Embora eu não tenha preferências pessoais como humanos, adoro conversar sobre diferentes interesses. Me conte mais!",
      "Hobbies são uma ótima forma de relaxar e se divertir! O que você gosta de fazer no seu tempo livre?",
      "Filmes, música, livros... há tantas formas de entretenimento! Qual é o seu favorito?",
      "Que legal! Você tem alguma recomendação? Mesmo sendo uma IA, gosto de 'ouvir' sobre diferentes gostos."
    ];
    resposta = respostasHobbies[Math.floor(Math.random() * respostasHobbies.length)];

  // Perguntas sobre comida
  } else if (perguntaLower.includes('comida') || perguntaLower.includes('comer') || perguntaLower.includes('receita') ||
             perguntaLower.includes('cozinhar') || perguntaLower.includes('pizza') || perguntaLower.includes('hambúrguer')) {
    const respostasComida = [
      "Comida é sempre um tópico delicioso! Embora eu não possa comer, posso conversar sobre culinária. Qual é seu prato favorito?",
      "Cozinhar pode ser muito relaxante e criativo! Você gosta de preparar suas próprias refeições?",
      "Que fome! Infelizmente não posso provar comida, mas adoro conversar sobre diferentes culinárias. O que você está pensando em comer?",
      "A culinária é uma arte! Tem algum prato especial que você gosta de preparar?"
    ];
    resposta = respostasComida[Math.floor(Math.random() * respostasComida.length)];

  // Perguntas sobre trabalho/estudos
  } else if (perguntaLower.includes('trabalho') || perguntaLower.includes('estudo') || perguntaLower.includes('escola') ||
             perguntaLower.includes('faculdade') || perguntaLower.includes('universidade') || perguntaLower.includes('carreira')) {
    const respostasTrabalho = [
      "Trabalho e estudos são partes importantes da vida! Como estão indo as coisas para você?",
      "Que área você trabalha ou estuda? Sempre é interessante conhecer diferentes profissões e campos de estudo.",
      "Educação e carreira são investimentos no futuro! Há algo específico que posso ajudar ou conversar sobre?",
      "Espero que seus estudos ou trabalho estejam indo bem! Quer compartilhar como tem sido sua experiência?"
    ];
    resposta = respostasTrabalho[Math.floor(Math.random() * respostasTrabalho.length)];

  // Respostas gerais mais inteligentes e variadas
  } else {
    const respostasGerais = [
      "Interessante pergunta! Embora eu seja uma IA com conhecimento limitado, vou fazer o meu melhor para ajudar. Pode me dar mais detalhes?",
      "Essa é uma questão que merece uma boa reflexão. O que você pensa sobre isso?",
      "Ótima pergunta! Posso não ter todas as respostas, mas estou aqui para conversar e ajudar no que for possível.",
      "Hmm, isso é algo interessante de se pensar. Você tem alguma opinião específica sobre o assunto?",
      "Que pergunta legal! Embora eu tenha limitações, adoro conversar sobre diferentes tópicos. Me conte mais!",
      "Essa é uma questão que pode ter várias perspectivas. O que te levou a pensar nisso?",
      "Interessante! Posso não ser um especialista, mas posso tentar ajudar. Quer elaborar mais sobre sua pergunta?",
      "Que tópico fascinante! Mesmo sendo uma IA simples, gosto de explorar diferentes assuntos. Qual é sua perspectiva?",
      "Boa pergunta! Embora eu não tenha acesso a informações em tempo real, posso tentar ajudar com o que sei. Me dê mais contexto!",
      "Isso me faz pensar... Você tem alguma teoria ou opinião sobre o assunto? Adoro uma boa conversa!"
    ];
    resposta = respostasGerais[Math.floor(Math.random() * respostasGerais.length)];
  }

  console.log(`[MODO FALLBACK] Pergunta: "${pergunta}" | Resposta: "${resposta}"`);
  res.json({ resposta });
});

// Nova rota para adicionar conhecimento em lote
app.post('/api/adicionar-conhecimento', (req, res) => {
  const { conhecimentos } = req.body;

  if (!conhecimentos || !Array.isArray(conhecimentos)) {
    return res.status(400).json({ erro: 'Lista de conhecimentos nao fornecida ou formato invalido.' });
  }

  let adicionados = 0;
  let erros = [];

  conhecimentos.forEach((item, index) => {
    if (item.pergunta && item.resposta) {
      const perguntaNormalizada = item.pergunta.toLowerCase().trim();
      conhecimentoPersonalizado.set(perguntaNormalizada, item.resposta);
      adicionados++;
      console.log(`[CONHECIMENTO ADICIONADO] P: "${perguntaNormalizada}" | R: "${item.resposta}"`);
    } else {
      erros.push(`Item ${index + 1}: pergunta ou resposta ausente`);
    }
  });

  const resultado = {
    sucesso: true,
    adicionados: adicionados,
    total: conhecimentos.length,
    erros: erros.length > 0 ? erros : null,
    mensagem: `${adicionados} conhecimentos adicionados com sucesso!`
  };

  res.json(resultado);
});

// Rota para listar todo o conhecimento atual
app.get('/api/listar-conhecimento', (req, res) => {
  const conhecimentos = [];

  for (let [pergunta, resposta] of conhecimentoPersonalizado) {
    conhecimentos.push({
      pergunta: pergunta,
      resposta: resposta
    });
  }

  res.json({
    total: conhecimentos.length,
    conhecimentos: conhecimentos
  });
});

// Rota para limpar todo o conhecimento
app.post('/api/limpar-conhecimento', (req, res) => {
  const totalAntes = conhecimentoPersonalizado.size;
  conhecimentoPersonalizado.clear();

  res.json({
    sucesso: true,
    mensagem: `${totalAntes} conhecimentos removidos. Base de conhecimento limpa!`
  });
});

// Rota para o caminho raiz - comentada para permitir que o index.html seja servido
// app.get('/', (req, res) => {
//   res.send('Servidor backend está funcionando!');
// });

// Rota para lidar com 404 - Not Found
app.use((req, res) => {
  res.status(404).send('Rota não encontrada.');
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando em http://localhost:" + PORT);
});
