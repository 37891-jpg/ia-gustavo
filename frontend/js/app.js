/**
 * ============================================================================
 * Samsung Device Manager - Frontend em JavaScript Puro (Vanilla JS)
 * ============================================================================
 */

// 1. Configuração Centralizada da URL da API
// Em ambiente local, conecta à porta 3000 do Express. Em produção (Vercel), utiliza o caminho relativo /api.
const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

// 2. Estado Global da Aplicação
const state = {
  aparelhos: [],
  termoBusca: '',
  idEmEdicao: null,
  aparelhoExclusao: null,
  carregando: false,
};

// 3. Seletores de Elementos do DOM
const DOM = {
  // Badges e contadores
  apiStatusBadge: document.getElementById('api-status-badge'),
  apiStatusText: document.getElementById('api-status-text'),
  devicesCounter: document.getElementById('devices-counter'),
  
  // Botões e inputs da Toolbar
  btnNovoAparelho: document.getElementById('btn-novo-aparelho'),
  btnRecarregar: document.getElementById('btn-recarregar'),
  inputBusca: document.getElementById('input-busca'),
  btnLimparBusca: document.getElementById('btn-limpar-busca'),
  
  // Containers de Estado
  stateLoading: document.getElementById('state-loading'),
  stateError: document.getElementById('state-error'),
  stateEmpty: document.getElementById('state-empty'),
  stateSuccess: document.getElementById('state-success'),
  errorMessage: document.getElementById('error-message'),
  btnTentarNovamente: document.getElementById('btn-tentar-novamente'),
  btnCadastrarVazio: document.getElementById('btn-cadastrar-vazio'),
  
  // Modal de Formulário
  modalAparelho: document.getElementById('modal-aparelho'),
  modalTitulo: document.getElementById('modal-titulo'),
  formAparelho: document.getElementById('form-aparelho'),
  aparelhoId: document.getElementById('aparelho-id'),
  inputModelo: document.getElementById('input-modelo'),
  inputCor: document.getElementById('input-cor'),
  inputPreco: document.getElementById('input-preco'),
  inputFoto: document.getElementById('input-foto'),
  imgPreview: document.getElementById('img-preview'),
  previewPlaceholder: document.getElementById('preview-placeholder'),
  btnFecharModal: document.getElementById('btn-fechar-modal'),
  btnCancelarForm: document.getElementById('btn-cancelar-form'),
  btnSalvarAparelho: document.getElementById('btn-salvar-aparelho'),
  btnSalvarTexto: document.getElementById('btn-salvar-texto'),
  btnSalvarSpinner: document.getElementById('btn-salvar-spinner'),
  
  // Erros de campos
  errorModelo: document.getElementById('error-modelo'),
  errorCor: document.getElementById('error-cor'),
  errorPreco: document.getElementById('error-preco'),
  errorFoto: document.getElementById('error-foto'),
  
  // Modal de Exclusão
  modalConfirmarExclusao: document.getElementById('modal-confirmar-exclusao'),
  deleteDeviceName: document.getElementById('delete-device-name'),
  btnCancelarExclusao: document.getElementById('btn-cancelar-exclusao'),
  btnConfirmarExclusao: document.getElementById('btn-confirmar-exclusao'),
  btnExcluirTexto: document.getElementById('btn-excluir-texto'),
  btnExcluirSpinner: document.getElementById('btn-excluir-spinner'),
  
  // Toasts
  toastContainer: document.getElementById('toast-container'),
};

// 4. Utilitários de Formatação e Interface

/**
 * Formata um valor numérico para Real Brasileiro (BRL)
 */
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Sanitiza strings para exibição segura no DOM
 */
function escaparHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Exibe notificação flutuante (Toast)
 */
function mostrarToast(mensagem, tipo = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  
  let icone = 'ℹ️';
  if (tipo === 'success') icone = '✓';
  if (tipo === 'error') icone = '✕';

  toast.innerHTML = `
    <span style="font-weight:bold; font-size:1.1rem">${icone}</span>
    <span>${escaparHtml(mensagem)}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 5. Integração com a API (fetch)

/**
 * Verifica o status de saúde da API
 */
async function verificarSaudeApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      DOM.apiStatusBadge.className = 'status-badge online';
      DOM.apiStatusBadge.title = 'API online e respondendo';
      DOM.apiStatusText.textContent = 'API Online';
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (error) {
    DOM.apiStatusBadge.className = 'status-badge offline';
    DOM.apiStatusBadge.title = 'Não foi possível conectar à API';
    DOM.apiStatusText.textContent = 'API Offline';
  }
}

/**
 * Lista todos os aparelhos
 */
async function carregarAparelhos() {
  exibirEstado('loading');
  state.carregando = true;

  try {
    const res = await fetch(`${API_BASE_URL}/aparelhos`);
    if (!res.ok) {
      const erroJson = await res.json().catch(() => ({}));
      throw new Error(erroJson.error || `Erro do servidor (${res.status})`);
    }

    const data = await res.json();
    state.aparelhos = Array.isArray(data) ? data : [];
    
    // Atualiza status para online após sucesso
    DOM.apiStatusBadge.className = 'status-badge online';
    DOM.apiStatusText.textContent = 'API Online';

    renderizarAparelhos();
  } catch (error) {
    console.error('[Frontend] Falha ao carregar aparelhos:', error);
    DOM.errorMessage.textContent = error.message || 'Verifique se o servidor backend está em execução.';
    DOM.apiStatusBadge.className = 'status-badge offline';
    DOM.apiStatusText.textContent = 'API Offline';
    exibirEstado('error');
  } finally {
    state.carregando = false;
  }
}

/**
 * Envia novo aparelho ou atualização para a API
 */
async function salvarAparelho(dados, id = null) {
  const isEdicao = Boolean(id);
  const url = isEdicao ? `${API_BASE_URL}/aparelhos/${id}` : `${API_BASE_URL}/aparelhos`;
  const metodo = isEdicao ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  });

  const resJson = await res.json().catch(() => ({}));

  if (!res.ok) {
    const mensagem = resJson.detalhes ? resJson.detalhes.join(' ') : (resJson.error || 'Erro ao salvar aparelho.');
    throw new Error(mensagem);
  }

  return resJson;
}

/**
 * Deleta um aparelho na API
 */
async function excluirAparelhoApi(id) {
  const res = await fetch(`${API_BASE_URL}/aparelhos/${id}`, {
    method: 'DELETE',
  });

  const resJson = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(resJson.error || 'Erro ao excluir o aparelho.');
  }

  return resJson;
}

// 6. Controle dos Estados Visuais da Interface

function exibirEstado(estado) {
  DOM.stateLoading.classList.add('hidden');
  DOM.stateError.classList.add('hidden');
  DOM.stateEmpty.classList.add('hidden');
  DOM.stateSuccess.classList.add('hidden');

  if (estado === 'loading') {
    DOM.stateLoading.classList.remove('hidden');
  } else if (estado === 'error') {
    DOM.stateError.classList.remove('hidden');
  } else if (estado === 'empty') {
    DOM.stateEmpty.classList.remove('hidden');
  } else if (estado === 'success') {
    DOM.stateSuccess.classList.remove('hidden');
  }
}

/**
 * Renderiza a lista de aparelhos com filtro de busca aplicado
 */
function renderizarAparelhos() {
  const termo = state.termoBusca.toLowerCase().trim();
  const filtrados = state.aparelhos.filter((ap) => {
    if (!termo) return true;
    return (
      (ap.modelo && ap.modelo.toLowerCase().includes(termo)) ||
      (ap.cor && ap.cor.toLowerCase().includes(termo))
    );
  });

  // Atualiza contador
  DOM.devicesCounter.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'aparelho' : 'aparelhos'}`;

  // Se não houver itens
  if (filtrados.length === 0) {
    if (state.aparelhos.length === 0) {
      document.getElementById('empty-description').textContent =
        'Nenhum aparelho Samsung foi cadastrado ainda. Comece adicionando um novo modelo ao catálogo.';
    } else {
      document.getElementById('empty-description').textContent =
        `Nenhum resultado encontrado para o termo "${state.termoBusca}". Tente outra pesquisa.`;
    }
    exibirEstado('empty');
    return;
  }

  // Renderiza cards no grid
  DOM.stateSuccess.innerHTML = '';
  filtrados.forEach((ap) => {
    const card = criarCardAparelho(ap);
    DOM.stateSuccess.appendChild(card);
  });

  exibirEstado('success');
}

/**
 * Cria o elemento DOM de um card de aparelho
 */
function criarCardAparelho(ap) {
  const card = document.createElement('article');
  card.className = 'device-card';
  card.dataset.id = ap._id;

  const fallbackImg = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'><path d='M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z'/></svg>";

  card.innerHTML = `
    <div class="device-image-wrap">
      <span class="device-color-badge">${escaparHtml(ap.cor)}</span>
      <img 
        src="${escaparHtml(ap.foto)}" 
        alt="${escaparHtml(ap.modelo)}" 
        class="device-img" 
        loading="lazy"
        onerror="this.onerror=null; this.src='${fallbackImg}'; this.style.opacity='0.5';"
      >
    </div>
    <div class="device-body">
      <h3 class="device-model">${escaparHtml(ap.modelo)}</h3>
      <div class="device-price-container">
        <span class="price-label">Preço Sugerido</span>
        <span class="device-price">${formatarMoeda(ap.preco)}</span>
      </div>
      <div class="device-actions">
        <button class="btn btn-secondary btn-sm btn-editar" data-id="${ap._id}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Editar
        </button>
        <button class="btn btn-danger btn-sm btn-excluir" data-id="${ap._id}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          Excluir
        </button>
      </div>
    </div>
  `;

  // Event Listeners das Ações do Card
  const btnEditar = card.querySelector('.btn-editar');
  btnEditar.addEventListener('click', () => abrirModalEdicao(ap._id));

  const btnExcluir = card.querySelector('.btn-excluir');
  btnExcluir.addEventListener('click', () => abrirModalExclusao(ap));

  return card;
}

// 7. Modais e Formulários

function limparErrosForm() {
  DOM.errorModelo.textContent = '';
  DOM.errorCor.textContent = '';
  DOM.errorPreco.textContent = '';
  DOM.errorFoto.textContent = '';

  DOM.inputModelo.classList.remove('invalid');
  DOM.inputCor.classList.remove('invalid');
  DOM.inputPreco.classList.remove('invalid');
  DOM.inputFoto.classList.remove('invalid');
}

function atualizarPreviewFoto(url) {
  const urlLimpa = (url || '').trim();
  if (urlLimpa.startsWith('http://') || urlLimpa.startsWith('https://')) {
    DOM.imgPreview.src = urlLimpa;
    DOM.imgPreview.classList.remove('hidden');
    DOM.previewPlaceholder.classList.add('hidden');
    DOM.imgPreview.onerror = () => {
      DOM.imgPreview.classList.add('hidden');
      DOM.previewPlaceholder.classList.remove('hidden');
      DOM.previewPlaceholder.textContent = 'Não foi possível carregar a imagem desta URL.';
    };
  } else {
    DOM.imgPreview.classList.add('hidden');
    DOM.previewPlaceholder.classList.remove('hidden');
    DOM.previewPlaceholder.textContent = 'Insira uma URL válida para visualizar a foto';
  }
}

function abrirModalCadastro() {
  state.idEmEdicao = null;
  DOM.formAparelho.reset();
  DOM.aparelhoId.value = '';
  DOM.modalTitulo.textContent = 'Cadastrar Novo Aparelho';
  DOM.btnSalvarTexto.textContent = 'Salvar Aparelho';
  limparErrosForm();
  atualizarPreviewFoto('');

  DOM.modalAparelho.classList.remove('hidden');
  DOM.inputModelo.focus();
}

function abrirModalEdicao(id) {
  const aparelho = state.aparelhos.find((a) => a._id === id);
  if (!aparelho) return;

  state.idEmEdicao = id;
  DOM.aparelhoId.value = aparelho._id;
  DOM.inputModelo.value = aparelho.modelo;
  DOM.inputCor.value = aparelho.cor;
  DOM.inputPreco.value = aparelho.preco;
  DOM.inputFoto.value = aparelho.foto;

  DOM.modalTitulo.textContent = 'Editar Aparelho';
  DOM.btnSalvarTexto.textContent = 'Atualizar Aparelho';
  limparErrosForm();
  atualizarPreviewFoto(aparelho.foto);

  DOM.modalAparelho.classList.remove('hidden');
  DOM.inputModelo.focus();
}

function fecharModalForm() {
  DOM.modalAparelho.classList.add('hidden');
  limparErrosForm();
  state.idEmEdicao = null;
}

function abrirModalExclusao(aparelho) {
  state.aparelhoExclusao = aparelho;
  DOM.deleteDeviceName.textContent = aparelho.modelo;
  DOM.modalConfirmarExclusao.classList.remove('hidden');
}

function fecharModalExclusao() {
  DOM.modalConfirmarExclusao.classList.add('hidden');
  state.aparelhoExclusao = null;
}

/**
 * Validação no cliente antes de enviar à API
 */
function validarFormulario(dados) {
  let valido = true;
  limparErrosForm();

  if (!dados.modelo || dados.modelo.trim().length === 0) {
    DOM.errorModelo.textContent = 'O modelo é obrigatório.';
    DOM.inputModelo.classList.add('invalid');
    valido = false;
  }

  if (!dados.cor || dados.cor.trim().length === 0) {
    DOM.errorCor.textContent = 'A cor é obrigatória.';
    DOM.inputCor.classList.add('invalid');
    valido = false;
  }

  if (dados.preco === '' || dados.preco === null || Number.isNaN(Number(dados.preco))) {
    DOM.errorPreco.textContent = 'Informe um preço válido.';
    DOM.inputPreco.classList.add('invalid');
    valido = false;
  } else if (Number(dados.preco) < 0) {
    DOM.errorPreco.textContent = 'O preço não pode ser negativo.';
    DOM.inputPreco.classList.add('invalid');
    valido = false;
  }

  const urlRegex = /^https?:\/\/.+/i;
  if (!dados.foto || !urlRegex.test(dados.foto.trim())) {
    DOM.errorFoto.textContent = 'Informe uma URL válida iniciando com http:// ou https://';
    DOM.inputFoto.classList.add('invalid');
    valido = false;
  }

  return valido;
}

// 8. Handlers de Eventos

// Submissão do Formulário de Aparelho
DOM.formAparelho.addEventListener('submit', async (e) => {
  e.preventDefault();

  const dados = {
    modelo: DOM.inputModelo.value,
    cor: DOM.inputCor.value,
    preco: DOM.inputPreco.value,
    foto: DOM.inputFoto.value,
  };

  if (!validarFormulario(dados)) {
    return;
  }

  // Prepara payload numérico
  const payload = {
    modelo: dados.modelo.trim(),
    cor: dados.cor.trim(),
    preco: parseFloat(dados.preco),
    foto: dados.foto.trim(),
  };

  // Trava botão com spinner
  DOM.btnSalvarAparelho.disabled = true;
  DOM.btnSalvarSpinner.classList.remove('hidden');

  try {
    if (state.idEmEdicao) {
      await salvarAparelho(payload, state.idEmEdicao);
      mostrarToast('Aparelho atualizado com sucesso!', 'success');
    } else {
      await salvarAparelho(payload);
      mostrarToast('Aparelho cadastrado com sucesso!', 'success');
    }

    fecharModalForm();
    await carregarAparelhos();
  } catch (error) {
    mostrarToast(error.message, 'error');
  } finally {
    DOM.btnSalvarAparelho.disabled = false;
    DOM.btnSalvarSpinner.classList.add('hidden');
  }
});

// Confirmação de Exclusão
DOM.btnConfirmarExclusao.addEventListener('click', async () => {
  if (!state.aparelhoExclusao) return;

  DOM.btnConfirmarExclusao.disabled = true;
  DOM.btnExcluirSpinner.classList.remove('hidden');

  try {
    await excluirAparelhoApi(state.aparelhoExclusao._id);
    mostrarToast(`Aparelho "${state.aparelhoExclusao.modelo}" excluído com sucesso!`, 'success');
    fecharModalExclusao();
    await carregarAparelhos();
  } catch (error) {
    mostrarToast(error.message, 'error');
  } finally {
    DOM.btnConfirmarExclusao.disabled = false;
    DOM.btnExcluirSpinner.classList.add('hidden');
  }
});

// Abertura de Modais
DOM.btnNovoAparelho.addEventListener('click', abrirModalCadastro);
DOM.btnCadastrarVazio.addEventListener('click', abrirModalCadastro);

// Fechamento de Modais
DOM.btnFecharModal.addEventListener('click', fecharModalForm);
DOM.btnCancelarForm.addEventListener('click', fecharModalForm);
DOM.btnCancelarExclusao.addEventListener('click', fecharModalExclusao);

// Fechar com clique fora ou tecla Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    fecharModalForm();
    fecharModalExclusao();
  }
});

DOM.modalAparelho.addEventListener('click', (e) => {
  if (e.target === DOM.modalAparelho) fecharModalForm();
});

DOM.modalConfirmarExclusao.addEventListener('click', (e) => {
  if (e.target === DOM.modalConfirmarExclusao) fecharModalExclusao();
});

// Preview da foto em tempo real ao digitar
DOM.inputFoto.addEventListener('input', (e) => {
  atualizarPreviewFoto(e.target.value);
});

// Busca em tempo real
DOM.inputBusca.addEventListener('input', (e) => {
  state.termoBusca = e.target.value;
  if (state.termoBusca.length > 0) {
    DOM.btnLimparBusca.classList.remove('hidden');
  } else {
    DOM.btnLimparBusca.classList.add('hidden');
  }
  renderizarAparelhos();
});

DOM.btnLimparBusca.addEventListener('click', () => {
  DOM.inputBusca.value = '';
  state.termoBusca = '';
  DOM.btnLimparBusca.classList.add('hidden');
  renderizarAparelhos();
  DOM.inputBusca.focus();
});

// Botões de recarregar e tentar novamente
DOM.btnRecarregar.addEventListener('click', () => {
  verificarSaudeApi();
  carregarAparelhos();
});

DOM.btnTentarNovamente.addEventListener('click', () => {
  verificarSaudeApi();
  carregarAparelhos();
});

// 9. Inicialização da Aplicação
document.addEventListener('DOMContentLoaded', () => {
  verificarSaudeApi();
  carregarAparelhos();
  // Checagem periódica suave de status da API
  setInterval(verificarSaudeApi, 30000);
});
