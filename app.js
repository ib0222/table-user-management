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
  constructor(name, address, email, phone_number, birthdate, job, company) {
    super(name, address, email, phone_number, birthdate);
    this.job = job;
    this.company = company;
  }

  isRetired() {
    return this.calculateAge() > 65;
  }
}
async function fetchUserData() {
  const response = await fetch("db.json");
  const data = await response.json();
  return data.map(
    (user) =>
      new User(
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
  });
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
