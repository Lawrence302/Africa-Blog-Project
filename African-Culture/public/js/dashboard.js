console.log('the dashboard.js file is loaded');
const delettBtn = document.querySelectorAll('.delete-btn');
const deleteModal = document.querySelector('.delete-modal');
const dashboardPage = document.querySelector('.dashboard-page');
const modalBox = document.querySelector('.modal-box');
const nobtn = document.querySelector('.no-btn');
const yesbtn = document.querySelector('.yes-btn');
const deletForm = document.querySelector('.delete-form');
let blogId = null;

delettBtn.forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    deleteModal.classList.toggle('hide');
    dashboardPage.classList.toggle('mode');

    console.log('the delete button is clicked');
    blogId = btn.id;
  });
});

nobtn.addEventListener('click', (e) => {
  e.preventDefault();
  deleteModal.classList.toggle('hide');
  dashboardPage.classList.toggle('mode');
});

yesbtn.addEventListener('click', () => {
  console.log('the yes button is clicked with the id ', blogId);
  // window.location.href = `/articles/delete/${blogId}`;
  deletForm.action = `/articles/delete/${blogId}?_method=DELETE`;
  deletForm.submit();
  // console.log(deletForm.action);
  deleteModal.classList.toggle('hide');
  dashboardPage.classList.toggle('mode');
});

deleteModal.addEventListener('click', (e) => {
  e.preventDefault();
  deleteModal.classList.toggle('hide');
  dashboardPage.classList.toggle('mode');
});

modalBox.addEventListener('click', (e) => {
  e.stopPropagation();
});
