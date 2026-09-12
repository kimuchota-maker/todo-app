async function loadTasks(){

    try {
        const response = await fetch("/tasks");
        if (!response.ok) {
            throw new Error("取得に失敗しました");
        }
        const tasks = await response.json();
        
        console.log("取得成功");
        const list = document.getElementById("task-list");
        list.replaceChildren();

        tasks.forEach(task => {

            const card = createTaskCard(task);

            list.appendChild(card);        

        });
    } catch (error) {
        console.log("取得失敗");
        console.error(error);
    }
}

function createTaskCard(task) {
    
    const card = document.createElement("div");
    card.className = "card mb-3";

    const cardBS = document.createElement("div");
    cardBS.className = "d-flex justify-content-between align-items-center";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const status = document.createElement("span");
    status.className = task.done ? "badge text-bg-success" : "badge text-bg-secondary";
    status.textContent = task.done ? "完了" : "未完了";

    const title = document.createElement("h5");
    title.className = "card-title";

    if (task.done) {
        title.classList.add("done");
    }

    title.textContent = task.title;

    const toggleButton = document.createElement("button");
    toggleButton.className = "btn btn-success btn-sm";
    toggleButton.textContent = "完了切り替え";
    toggleButton.addEventListener("click", () => {
        toggleTask(task.id, task.title, task.done);
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-danger btn-sm";
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => {
        openDeleteModal(task.id, task.title);
    });

    const buttonArea = document.createElement("div");
    buttonArea.className = "d-flex gap-2 mt-3";

    buttonArea.appendChild(toggleButton);
    buttonArea.appendChild(deleteButton);

    cardBody.appendChild(title);
    cardBody.appendChild(status);
    
    cardBS.appendChild(cardBody);
    cardBS.appendChild(buttonArea);
    card.appendChild(cardBS);
    
    return card;
}

async function addTask(){
    try{
        const input = document.getElementById("title");
        const title = input.value.trim();

        if(title === ""){
            return;
        }

        const response = await fetch("/tasks", {
            method:"POST",

            headers:{
                "Content-Type": "application/json"
            },

            body:JSON.stringify({
                title: title,
                done: false
            })
        });

        if (!response.ok) {
            throw new Error("追加に失敗しました");
        }
        
        console.log("追加成功");

        input.value = "";

        await loadTasks();

        showAlert("タスクを追加しました");
        
    } catch (error) {
        console.log("追加失敗");
        console.error(error);
    }
}

let deleteTaskId = null;
function openDeleteModal(id, title) {

    deleteTaskId = id;

    document.getElementById("delete-message").textContent =
        `「${title}」を削除しますか？`;

    const modalElement = document.getElementById("deleteModal");

    const modal = new bootstrap.Modal(modalElement);

    modal.show();
}

document.getElementById("confirm-delete-button")
    .addEventListener("click", async function() {

        if (deleteTaskId === null) {
            return;
        }

        try {

            const response = await fetch(
                `/tasks/${deleteTaskId}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error("削除に失敗しました");
            }

            const modalElement = document.getElementById("deleteModal");

            const modal = bootstrap.Modal.getInstance(modalElement);

            modal.hide();

            await loadTasks();

            showAlert("タスクを削除しました");

            deleteTaskId = null;

        } catch (error) {

            console.error(error);

            showAlert("削除に失敗しました", "danger");

        }

    });

async function toggleTask(id,title,done) {
    try{
        const response = await fetch(`/tasks/${id}`, {
            method: "PUT",
            
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title,
                done: !done
            })
        });
        if (!response.ok) {
            throw new Error("切替に失敗しました");
        }
        console.log("切替成功");

        await loadTasks();
    } catch(error) {
        console.log("切替失敗");
        console.error(error);
    }
}

async function handleKey(event){
    if(event.key === "Enter"){
        await addTask();
    }
}

function showAlert(message, type = "success") {
    const alertArea = document.getElementById("alert-area");

        alertArea.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="alert">
                </button>
            </div>
        `;
    }


const input = document.getElementById("title");
const addButton = document.getElementById("add-button");

addButton.addEventListener("click", addTask);

input.addEventListener("keydown", handleKey)


loadTasks();
