class Person {
  constructor(name, address, email, phone_number, birthdate) {
    this.name = name;
    this.address = address;
    this.email = email;
    this.phone_number = phone_number;
    this.birthdate = new Date(birthdate);
  }

  calculateAge() {
    const diff = Date.now() - this.birthdate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
}

class User extends Person {
  constructor(id, name, address, email, phone_number, birthdate, job, company) {
    super(name, address, email, phone_number, birthdate);
    this.id = id;
    this.job = job;
    this.company = company;
  }

  isRetired() {
    return this.calculateAge() > 65;
  }
}

async function fetchUserData() {
  const response = await fetch("http://localhost:3000/users");
  const data = await response.json();
  return data.map(
    (user, index) =>
      new User(
        index,
        user.name,
        user.address,
        user.email,
        user.phone_number,
        user.birthdate,
        user.job,
        user.company
      )
  );
}

let users = [];
let currentPage = 1;
const rowsPerPage = 10;

document.addEventListener("DOMContentLoaded", async () => {
  users = await fetchUserData();
  renderTable(users);
  setupPagination();
  document
    .getElementById("search-input")
    .addEventListener("input", handleSearch);
  document
    .getElementById("previous-button")
    .addEventListener("click", () => changePage(-1));
  document
    .getElementById("next-button")
    .addEventListener("click", () => changePage(1));
  document
    .getElementById("add-user-button")
    .addEventListener("click", openAddUserModal);
  document
    .getElementById("cancel-button")
    .addEventListener("click", closeModal);
  document
    .getElementById("user-form")
    .addEventListener("submit", handleFormSubmit);
});

function renderTable(data) {
  const tbody = document.getElementById("user-table-body");
  tbody.innerHTML = "";
  const pageData = paginate(data, currentPage, rowsPerPage);
  pageData.forEach((user) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = user.name;
    row.insertCell(1).innerText = user.address;
    row.insertCell(2).innerText = user.email;
    row.insertCell(3).innerText = user.phone_number;
    row.insertCell(4).innerText = user.job;
    row.insertCell(5).innerText = user.company;
    row.insertCell(6).innerText = user.calculateAge();
    row.insertCell(7).innerText = user.isRetired() ? "Yes" : "No";
    row.insertCell(
      8
    ).innerHTML = `
      <button class="edit-button bg-yellow-500 text-white px-4 py-2 rounded mr-2" data-id="${user.id}">🖊️</button>
      <button class="delete-button bg-red-600 text-white px-4 py-2 rounded" data-id="${user.id}">🗑️</button>
    `;
  });
  setupDeleteButtons();
  setupEditButtons();
  updatePaginationInfo(data.length);
}

function paginate(data, page, rowsPerPage) {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return data.slice(start, end);
}

function setupPagination() {
  const totalPages = Math.ceil(users.length / rowsPerPage);
  document.getElementById(
    "pagination-info"
  ).innerText = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("previous-button").disabled = currentPage === 1;
  document.getElementById("next-button").disabled = currentPage === totalPages;
}

function updatePaginationInfo(totalItems) {
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  document.getElementById(
    "pagination-info"
  ).innerText = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("previous-button").disabled = currentPage === 1;
  document.getElementById("next-button").disabled = currentPage === totalPages;
}

function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
  );
  currentPage = 1;
  renderTable(filteredUsers);
  setupPagination(filteredUsers);
}

function changePage(direction) {
  const totalPages = Math.ceil(users.length / rowsPerPage);
  if (currentPage + direction > 0 && currentPage + direction <= totalPages) {
    currentPage += direction;
    renderTable(users);
    setupPagination();
  }
}

function setupDeleteButtons() {
  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const selectedId = parseInt(e.target.getAttribute("data-id"));
      users = users.filter((user) => user.id !== selectedId);
      renderTable(users);
      setupPagination();
    });
  });
}

function setupEditButtons() {
  document.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const selectedId = parseInt(e.target.getAttribute("data-id"));
      const user = users.find((user) => user.id === selectedId);
      openEditUserModal(user);
    });
  });
}

function openAddUserModal() {
  document.getElementById("user-form").reset();
  document.getElementById("user-id").value = "";
  document.getElementById("modal-title").innerText = "Add User";
  document.getElementById("user-modal").classList.remove("hidden");
}

function openEditUserModal(user) {
  document.getElementById("user-id").value = user.id;
  document.getElementById("name").value = user.name;
  document.getElementById("address").value = user.address;
  document.getElementById("email").value = user.email;
  document.getElementById("phone_number").value = user.phone_number;
  document.getElementById("birthdate").value = user.birthdate.toISOString().split('T')[0];
  document.getElementById("job").value = user.job;
  document.getElementById("company").value = user.company;
  document.getElementById("modal-title").innerText = "Edit User";
  document.getElementById("user-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("user-modal").classList.add("hidden");
}

function handleFormSubmit(event) {
  event.preventDefault();
  const id = document.getElementById("user-id").value;
  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const email = document.getElementById("email").value;
  const phone_number = document.getElementById("phone_number").value;
  const birthdate = document.getElementById("birthdate").value;
  const job = document.getElementById("job").value;
  const company = document.getElementById("company").value;

  if (id) {
    // Edit existing user
    const user = users.find((user) => user.id === parseInt(id));
    user.name = name;
    user.address = address;
    user.email = email;
    user.phone_number = phone_number;
    user.birthdate = new Date(birthdate);
    user.job = job;
    user.company = company;
  } else {
    // Add new user
    const newUser = new User(
      users.length,
      name,
      address,
      email,
      phone_number,
      new Date(birthdate),
      job,
      company
    );
    users.push(newUser);
  }

  renderTable(users);
  setupPagination();
  closeModal();
}
