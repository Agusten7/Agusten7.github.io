document.addEventListener("DOMContentLoaded", () => {
    const projects = document.querySelectorAll(".project");

    projects.forEach((project, index) => {
        setTimeout(() => {
            project.classList.add("visible");
        }, index * 150);
    });
});
