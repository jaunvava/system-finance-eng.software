function initCategorias() {
  const data = getData();
  const lista = document.getElementById("listaCategorias");

  function renderCat() {
    if (!lista) return;
    lista.innerHTML = "";

    const listGroup = document.createElement("div");
    listGroup.className = "list-group shadow-sm";

    data.categorias.forEach((c, i) => {
      const item = document.createElement("div");
      item.className =
        "list-group-item d-flex justify-content-between align-items-center py-3";
      item.innerHTML = `
        <span class="fw-medium">${c}</span>
        <button class="btn btn-sm btn-danger" onclick="deletarCategoria(${i})"><i class="fa-solid fa-trash"></i></button>
      `;
      listGroup.appendChild(item);
    });
    lista.appendChild(listGroup);
  }

  window.deletarCategoria = function (index) {
    if (confirm(`Excluir categoria "${data.categorias[index]}"?`)) {
      data.categorias.splice(index, 1);
      saveData(data);
      renderCat();
    }
  };

  const formCat = document.getElementById("formCategoria");
  if (formCat) {
    formCat.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = formCat.querySelector('input[type="text"]');
      const val = input.value.trim();
      if (val && !data.categorias.includes(val)) {
        data.categorias.push(val);
        saveData(data);
        formCat.reset();
        renderCat();
      }
    });
  }

  renderCat();
}
