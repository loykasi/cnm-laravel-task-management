import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useToggleState } from "../hooks/useToggleState"
import axios from "axios";

const KanbanBoard = () => {
    const [createList, toggleCreateList, enableCreateList] = useToggleState(false);
    const [newListTitle, setNewListTile] = useState("");

    const [project, setProject] = useState();
    const { id } = useParams();

    function syncCreateList() {
        toggleCreateList();

        const cloneProject = { ... project }

        const list = {
            id: "",
            projectId: project.id,
            name: newListTitle,
            order: project.lists.length,
            isCreating: false,
            cards: []
        };
        cloneProject.lists.push(list);

        const listInput = {
            name: newListTitle,
            projectId: project.id
        };

        const token = localStorage.getItem("auth_token");
        if (token) {
            axios.post(`http://localhost:8000/api/list`, listInput, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                console.log(response.data);
                list.id = response.data.id;
            })
            .catch(error => {
                console.error(error);
            });
        }

        setProject(cloneProject);
    }

    async function fetchtProject() {
        const token = localStorage.getItem("auth_token");
        if (token) {
            axios.get(`http://localhost:8000/api/project/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(response => {
                const data = response.data.data;
                data.lists.forEach((item) => {
                    item.isCreating = false;
                });
                setProject(data);
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });
        }
    }

    function toggleCreateCard(index) {
        const cloneProject = { ...project }
        const list = cloneProject.lists[index];
        list.isCreating = !list.isCreating;
        setProject(cloneProject);
    }

    useEffect(() => {
        fetchtProject();
    }, [])

    const listsDisplay = project?.lists.map((list, index) => { return (
        <div key={list.id} className={"p-3 w-80 flex-shrink-0 bg-gray-100 rounded"}>
            <h3 className={"text-sm font-medium text-gray-900"}>{ list.name }</h3>
            <ul className={"mt-2"}>
            {/* <li className={""}>
                <a href="#" className={"block p-5 bg-white rounded shadow"}>
                <div className={"flex justify-between"}>
                    <p className={"text-sm font-medium leading-snug text-gray-900 text-left"}>
                    Add discount code to checkout page
                    </p>
                    <span>
                    <img
                        className={"h-6 w-6 rounded-full"}
                        src="https://i.pravatar.cc/100" alt="avatar"
                    />
                    </span> 
                </div>
                <div className={"flex justify-between items-baseline"}>
                    <div className={"text-sm text-gray-600"}>
                    <time dateTime="2019-09-14">Sep 14</time>
                    </div>
                    <div className={"mt-2"}>
                    <span className={"px-2 py-1 leading-tight inline-flex items-center bg-teal-100 rounded"}>
                        <svg className={"h-2 w-2 text-teal-500"} viewBox="0 0 8 8" fill="currentColor">
                        <circle cx="4" cy="4" r="3"/>
                        </svg>
                        <span className={"text-sm ml-2 font-medium text-teal-900"}>Feature Request</span>
                    </span>
                    </div>
                </div>
                </a>
            </li> */}

            {list.isCreating && 
            <li className={"mt-3"}>
                <a href="#" className={"block p-5 bg-white rounded shadow"}>
                <div className={"flex justify-between"}>
                    <input
                    className={"w-full text-sm leading-8 text-gray-900 text-left bg-gray-100 px-1 rounded border"}
                    type="text"
                    placeholder="New card name"
                    />
                </div>
                <div className={"flex justify-end items-center mt-2 space-x-2"}>
                    <button
                        onClick={() => toggleCreateCard(index)}
                        type="button"
                        className={"px-2 py-1 h-8 leading-tight inline-flex items-center rounded hover:bg-gray-300"}
                    >
                        <svg className="w-5 h-5 text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                        </svg>
                    </button>
                    <button type="button" className={"px-2 py-1 h-8 leading-tight inline-flex items-center text-white bg-gray-800 rounded hover:bg-gray-700"}>
                        <span className={"text-sm font-medium"}>Add card</span>
                    </button>
                </div>
                </a>
            </li>
            }

            {!list.isCreating &&
            <li className={"mt-3"}>
                <button
                    onClick={() => toggleCreateCard(index)}
                    className={"block px-5 py-2 shadow w-full text-white bg-gray-800 rounded hover:bg-gray-700"}
                >
                <div className={"flex justify-center"}>
                    <span>New card</span>
                </div>
                </button>
            </li>
            }

            </ul> 
        </div>
    )})

    return (
        <>
        <div className={"flex-1 overflow-auto"}>
            <header className={"px-6 border-b border-gray-200"}>
            <div className={"flex justify-between items-center py-2"}>
                <div className={"flex"}>
                <h2 className={"text-2xl font-semibold text-gray-900 leading-tight"}>{ project?.name }</h2>
                <div className={"flex ml-6"}>
                    <span className={"-ml-2 rounded-full border-2 border-white"}>
                    <img className={"h-6 w-6 rounded-full object-cover"} src="https://i.pravatar.cc/100" alt="avatar"/>
                    </span>
                    <span className={"-ml-2 rounded-full border-2 border-white"}>
                    <img className={"h-6 w-6 rounded-full object-cover"} src="https://i.pravatar.cc/100" alt="avatar"/>
                    </span>
                    <span className={"-ml-2 rounded-full border-2 border-white"}>
                    <img className={"h-6 w-6 rounded-full object-cover"} src="https://i.pravatar.cc/100" alt="avatar"/>
                    </span>
                    <span className={"-ml-2 rounded-full border-2 border-white"}>
                    <img className={"h-6 w-6 rounded-full object-cover"} src="https://i.pravatar.cc/100" alt="avatar"/>
                    </span>
                </div>
                </div>
                <div className={"flex"}>
                <span className={"inline-flex p-1 border bg-gray-200 rounded"}>
                    <button className={"px-2 py-1 rounded"}>
                    <svg className={" h-6 w-6 text-gray-600 "} height="512" viewBox="0 -53 384 384" width="512" xmlns="http://www.w3.org/2000/svg">
                        <path stroke="currentColor" d="M368 154.668H16c-8.832 0-16-7.168-16-16s7.168-16 16-16h352c8.832 0 16 7.168 16 16s-7.168 16-16 16zm0 0M368 32H16C7.168 32 0 24.832 0 16S7.168 0 16 0h352c8.832 0 16 7.168 16 16s-7.168 16-16 16zm0 0M368 277.332H16c-8.832 0-16-7.168-16-16s7.168-16 16-16h352c8.832 0 16 7.168 16 16s-7.168 16-16 16zm0 0"/>
                    </svg>
                    </button>
                    <button className={"px-2 py-1 bg-white shadow rounded"}>
                    <svg className={" h-6 w-6 text-gray-600 "} height="512" viewBox="0 -53 384 384" width="512" xmlns="http://www.w3.org/2000/svg">
                        <path stroke="currentColor" d="M368 154.668H16c-8.832 0-16-7.168-16-16s7.168-16 16-16h352c8.832 0 16 7.168 16 16s-7.168 16-16 16zm0 0M368 32H16C7.168 32 0 24.832 0 16S7.168 0 16 0h352c8.832 0 16 7.168 16 16s-7.168 16-16 16zm0 0M368 277.332H16c-8.832 0-16-7.168-16-16s7.168-16 16-16h352c8.832 0 16 7.168 16 16s-7.168 16-16 16zm0 0"/>
                    </svg>
                    </button>
                </span>
                <button
                    onClick={() => { enableCreateList() }}
                    className={"ml-5 flex items-center pl-2 pr-4 py-1 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700"}
                >
                    <svg className={"h-5 w-5"} viewBox="0 0 24 24" fill="none">
                    <path 
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        d="M12 7v10m5-5H7"
                    />
                    </svg>
                    <span className={"ml-1"}>New List</span>
                </button>
                </div>
            </div>
            </header>
            <main className={"p-3 inline-flex space-x-3"}>

            { listsDisplay }

            {createList &&
            <div className={"flex-shrink-0 w-80"}>
                <div className="bg-gray-100 p-3 rounded">
                <input
                    className="leading-8 text-sm font-medium text-gray-900 p-1 w-full border rounded"
                    type="text"
                    placeholder="New list title"
                    value={newListTitle}
                    onChange={(e) => setNewListTile(e.target.value)}
                />
                <div className={"flex justify-end items-center mt-2 space-x-2"}>
                    <button
                        onClick={() => { toggleCreateList(); setNewListTile("") }}
                        type="button"
                        className={"px-2 py-1 h-8 leading-tight inline-flex items-center rounded hover:bg-gray-300"}
                    >
                        <svg className="w-5 h-5 text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                        </svg>
                    </button>
                    <button
                        onClick={() => syncCreateList()}
                        type="button"
                        className={"px-2 py-1 w-24 h-8 leading-tight inline-flex items-center justify-center text-white bg-gray-800 rounded hover:bg-gray-700"}
                    >
                        <span className={"text-sm font-medium"}>Add list</span>
                    </button>
                </div>
                </div>
            </div>
            }  
            </main>
        </div>
        </>
    );
}

export default KanbanBoard;