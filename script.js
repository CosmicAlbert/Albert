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
const sortButtons = document.querySelectorAll(".sort-btn");

const columns = [
    { key: "name", label: "Project" },
    { key: "type", label: "Type" },
    { key: "context", label: "Context" },
    { key: "description", label: "Description" }
];

let projects = [];
let sortKey = null;
let sortDirection = "ascending";

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

function getVisibleProjects() {
    const query = dataSearch.value.trim().toLowerCase();

    let visible = projects.filter((project) => {
        if (!query) return true;
        return columns.some((column) =>
            String(project[column.key]).toLowerCase().includes(query)
        );
    });

    if (sortKey) {
        visible = visible.slice().sort((a, b) => {
            const result = String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, {
                sensitivity: "base"
            });
            return sortDirection === "ascending" ? result : -result;
        });
    }

    return visible;
}

function renderTable() {
    const visible = getVisibleProjects();

    dataBody.textContent = "";
    dataCount.textContent = visible.length + " of " + projects.length + " projects";

    if (visible.length === 0) {
        showStatus("No projects match your search.", false);
        return;
    }

    hideStatus();

    visible.forEach((project) => {
        const row = document.createElement("tr");

        columns.forEach((column) => {
            const cell = document.createElement("td");
            cell.setAttribute("data-label", column.label);

            if (column.key === "context") {
                const badge = document.createElement("span");
                badge.className = "badge";
                badge.textContent = project[column.key];
                cell.appendChild(badge);
            } else {
                cell.textContent = project[column.key];
            }

            row.appendChild(cell);
        });

        dataBody.appendChild(row);
    });
}

function updateSortIndicators() {
    sortButtons.forEach((button) => {
        const header = button.parentElement;
        header.setAttribute(
            "aria-sort",
            button.dataset.key === sortKey ? sortDirection : "none"
        );
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
        showStatus("Could not load the project data. Please try again.", true);
    }
}

sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const key = button.dataset.key;

        if (sortKey === key) {
            sortDirection = sortDirection === "ascending" ? "descending" : "ascending";
        } else {
            sortKey = key;
            sortDirection = "ascending";
        }

        updateSortIndicators();
        renderTable();
    });
});

dataSearch.addEventListener("input", renderTable);
dataRetry.addEventListener("click", loadProjects);

loadProjects();

$(function () {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const $skillsCard = $("#skills .card");
    const $chips = $(".skills-list li");
    let chipsAnimated = false;

    $chips.css({ opacity: 0, top: 25 });

    function animateChips() {
        if (chipsAnimated) return;

        const triggerPoint = $(window).scrollTop() + $(window).height() - 120;

        if ($skillsCard.offset().top > triggerPoint) return;

        chipsAnimated = true;

        $chips.each(function (index) {
            $(this).delay(index * 120).animate({ opacity: 1, top: 0 }, 400);
        });
    }

    $(window).on("scroll", animateChips);
    animateChips();
});