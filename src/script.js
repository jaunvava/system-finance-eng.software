const storage_kay = "financas_data";

function getData() {
  const defaultData = {
    transacoes: [],
    categorias: [
      "Alimentação",
      "Transporte",
      "Lazer",
      "Moradia",
      "Estudo",
      "Outros",
    ],
    orcamentos: {},
  };
  return JSON.parse(localStorage.getItem(storage_kay)) || defaultData;
}

function saveData(data) {
  localStorage.setItem(storage_kay, JSON.stringify(data));
}

function formatarMoeda(valor) {
  return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const routes = {
  dashboard: {
    url: "dashboard/dashboard.html",
    init: () => typeof initDashboard === 'function' && initDashboard()
  },
  transacoes: {
    url: "transacoes/transacoes.html",
    init: () => typeof initTransacoes === 'function' && initTransacoes()
  },
  categorias: {
    url: "categorias/categorias.html",
    init: () => typeof initCategorias === 'function' && initCategorias()
  },
  relatorios: {
    url: "relatorios/relatorios.html",
    init: () => typeof initRelatorios === 'function' && initRelatorios()
  },
  orcamento: {
    url: "orcamentos/orcamento.html",
    init: () => typeof initOrcamento === 'function' && initOrcamento()
  }
};

async function navigateTo(pageKey) {
  const route = routes[pageKey];
  if (!route) return;

  const contentArea = document.getElementById("content-area");
  contentArea.classList.remove("loaded");

  try {
    const response = await fetch(route.url);
    const html = await response.text();
    
    contentArea.innerHTML = html;
    
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("onclick")?.includes(pageKey)) {
        link.classList.add("active");
      }
    });

    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        navbarCollapse.classList.remove('show');
    }

    route.init();

    setTimeout(() => {
      contentArea.classList.add("loaded");
    }, 50);

  } catch (error) {
    console.error("Erro ao carregar página:", error);
    contentArea.innerHTML = `<div class="alert alert-danger">Erro ao carregar a página: ${error.message}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
    navigateTo('dashboard');
    
    const toggler = document.getElementById('navbarTogglerBtn');
    const collapse = document.getElementById('navbarNav');
    if(toggler && collapse) {
      toggler.addEventListener('click', () => {
        collapse.classList.toggle('show');
      });
    }
});
