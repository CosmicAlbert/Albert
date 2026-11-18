
document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        const target = document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", targetId);
    });
});



const themeButton = document.getElementById("theme-toggle");

function applyTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    themeButton.textContent = isDark ? "Light Mode" : "Dark Mode";
}

let savedTheme = null;

try {
    savedTheme = localStorage.getItem("theme");
} catch (error) {
    savedTheme = null;
}

applyTheme(savedTheme === "dark");

themeButton.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark-mode");

    applyTheme(isDark);

    try {
        localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch (error) {}
});


const dataTable = document.getElementById("data-table");
const dataBody = document.getElementById("data-body");
const dataStatus = document.getElementById("data-status");
const dataMessage = document.getElementById("data-message");
const dataRetry = document.getElementById("data-retry");
const dataSearch = document.getElementById("data-search");
const dataCount = document.getElementById("data-count");

let projects = [];

function showStatus(message, showRetry) {
    dataMessage.textContent = message;
    dataRetry.classList.toggle("is-hidden", !showRetry);
    dataStatus.classList.remove("is-hidden");
    dataTable.classList.add("is-hidden");
}

function hideStatus() {
    dataStatus.classList.add("is-hidden");
    dataTable.classList.remove("is-hidden");
}

function renderTable() {
    const query = dataSearch.value.trim().toLowerCase();

    const filteredProjects = projects.filter((project) => {
        return (
            project.name.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query)
        );
    });

    dataBody.textContent = "";

    dataCount.textContent =
        filteredProjects.length + " of " + projects.length + " projects";

    if (filteredProjects.length === 0) {
        showStatus("No projects match your search.", false);
        return;
    }

    hideStatus();

    filteredProjects.forEach((project) => {

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = project.name;
        nameCell.setAttribute("data-label", "Project");

        const imageCell = document.createElement("td");
        imageCell.setAttribute("data-label", "Screenshot");

        const image = document.createElement("img");
        image.src = project.image;
        image.alt = project.name + " screenshot";
        image.className = "project-preview";

        imageCell.appendChild(image);

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = project.description;
        descriptionCell.setAttribute("data-label", "Description");

        row.appendChild(nameCell);
        row.appendChild(imageCell);
        row.appendChild(descriptionCell);

        dataBody.appendChild(row);

    });
}

async function loadProjects() {
    showStatus("Loading projects...", false);
    dataCount.textContent = "";

    try {
        const response = await fetch("data/projects.json");

        if (!response.ok) {
            throw new Error("Request failed with status " + response.status);
        }

        projects = await response.json();

        renderTable();

    } catch (error) {
        console.error("Could not load projects:", error);
        showStatus("Could not load project data. Please try again.", true);
    }
}

dataSearch.addEventListener("input", renderTable);

dataRetry.addEventListener("click", loadProjects);

loadProjects();


const imageModal = document.getElementById("image-modal");
const enlargedImage = document.getElementById("enlarged-image");
const imageCaption = document.getElementById("image-caption");
const closeModal = document.getElementById("close-modal");

function openImage(image) {
    enlargedImage.src = image.src;
    enlargedImage.alt = image.alt;
    imageCaption.textContent = image.alt;

    imageModal.classList.remove("is-hidden");
}

function hideImage() {
    imageModal.classList.add("is-hidden");
    enlargedImage.src = "";
}

dataBody.addEventListener("click", (event) => {
    const image = event.target.closest(".project-preview");

    if (image) {
        openImage(image);
    }
});

closeModal.addEventListener("click", hideImage);

imageModal.addEventListener("click", (event) => {
    if (event.target === imageModal) {
        hideImage();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        hideImage();
    }
});



$(function () {

    const $skillsSection = $("#skills");
    const $chips = $(".skills-list li");

    function animateSkills() {

        const windowBottom = $(window).scrollTop() + $(window).height();
        const skillsTop = $skillsSection.offset().top;

        if (windowBottom > skillsTop + 100) {

            $chips.each(function (index) {

                $(this)
                    .stop(true)
                    .delay(index * 120)
                    .animate({
                        opacity: 1,
                        top: 0
                    }, 400);

            });

        } else {

            $chips.stop(true).css({
                opacity: 0,
                top: 25
            });

        }
    }

    $(window).on("scroll", animateSkills);

    animateSkills();

});
