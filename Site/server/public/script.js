// Elementos
const chatInputEl = document.getElementById("chat-input");
const sendBtnEl = document.getElementById("send-btn");
const chatMessagesEl = document.getElementById("chat-messages");
const typingIndicatorEl = document.getElementById("typing-indicator");
const chatListEl = document.getElementById("chat-list");
const newChatBtn = document.getElementById("new-chat-btn");

// Estrutura para guardar os chats {chatId: [{from, text}, ...], ...}
let chats = {};
let currentChatId = null;

// Simulação de respostas da IA (exemplo)
const IA_RESPONSES = [
  "Claro, posso ajudar com isso!",
  "Entendi, vou analisar sua pergunta.",
  "Essa é uma boa questão, deixe-me pensar.",
  "Posso te ajudar com mais informações sobre isso.",
  "Vou buscar a melhor resposta para você.",
];

// --- Funções ---

function criarNovoChat() {
  const id = "chat_" + Date.now();
  chats[id] = [];
  currentChatId = id;
  salvarChats();
  atualizarListaChats();
  renderMessages();
  chatInputEl.focus();
}

function atualizarListaChats() {
  chatListEl.innerHTML = "";
  for (const id in chats) {
    const div = document.createElement("div");
    div.classList.add("chat-list-item");
    if (id === currentChatId) div.classList.add("active");
    div.textContent = `Chat ${id.slice(-4)}`;
    div.onclick = () => {
      currentChatId = id;
      renderMessages();
      atualizarListaChats();
    };
    chatListEl.appendChild(div);
  }
}

function salvarChats() {
  localStorage.setItem("meus_chats_ia", JSON.stringify(chats));
  localStorage.setItem("chat_ativo_ia", currentChatId);
}

function carregarChats() {
  const dados = localStorage.getItem("meus_chats_ia");
  const ativo = localStorage.getItem("chat_ativo_ia");
  if (dados) {
    chats = JSON.parse(dados);
    if (ativo && chats[ativo]) {
      currentChatId = ativo;
    } else {
      const chaves = Object.keys(chats);
      currentChatId = chaves.length > 0 ? chaves[0] : null;
    }
  } else {
    criarNovoChat();
  }
}

function renderMessages() {
  chatMessagesEl.innerHTML = "";
  if (!currentChatId || !chats[currentChatId]) return;

  for (const msg of chats[currentChatId]) {
    const div = document.createElement("div");
    div.classList.add("chat-message", msg.from);
    const p = document.createElement("p");
    p.textContent = msg.text;
    div.appendChild(p);
    chatMessagesEl.appendChild(div);
  }
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function enviarMensagem() {
  const texto = chatInputEl.value.trim();
  if (!texto || !currentChatId) return;

  // Adiciona mensagem do usuário
  chats[currentChatId].push({ from: "user", text: texto });
  salvarChats();
  renderMessages();
  chatInputEl.value = "";
  chatInputEl.disabled = true;

  // Simular IA pensando
  mostrarTyping(true);

  // Simular delay e depois responder com efeito digitando
  setTimeout(() => {
    mostrarTyping(false);
    simularRespostaIA(texto);
  }, 1500);
}

function mostrarTyping(mostrar) {
  typingIndicatorEl.hidden = !mostrar;
}

async function simularRespostaIA(textoUsuario) {
  // Escolher resposta aleatória
  const resposta = IA_RESPONSES[Math.floor(Math.random() * IA_RESPONSES.length)];

  // Mostrar resposta letra por letra
  await typeBotResponse(resposta);

  chatInputEl.disabled = false;
  chatInputEl.focus();
}

function typeBotResponse(text) {
  return new Promise((resolve) => {
    let i = 0;
    const div = document.createElement("div");
    div.classList.add("chat-message", "bot");
    const p = document.createElement("p");
    div.appendChild(p);
    chatMessagesEl.appendChild(div);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;

    function type() {
      if (i < text.length) {
        p.textContent += text.charAt(i);
        i++;
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
        setTimeout(type, 40);
      } else {
        // Salvar a resposta completa depois de terminar
        chats[currentChatId].push({ from: "bot", text });
        salvarChats();
        resolve();
      }
    }

    type();
  });
}

// --- Eventos ---

sendBtnEl.addEventListener("click", enviarMensagem);

chatInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    enviarMensagem();
  }
});

newChatBtn.addEventListener("click", () => {
  criarNovoChat();
});

// --- Inicialização ---

carregarChats();
atualizarListaChats();
renderMessages();
