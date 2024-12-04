import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useToggleState } from "../hooks/useToggleState"
import UserGroupDisplay from "../Component/UserGroupDisplay.jsx"
import Addmember from "../Component/Addmember.jsx"
import axios from "axios";
import EditCardModal from "../Component/EditCardModal";

const KanbanBoard = () => {
    const [createList, toggleCreateList, enableCreateList] = useToggleState(false);
    const [newListTitle, setNewListTitle] = useState("");
    const [newCardTitle, setNewCardTitle] = useState("");
    const [onActionListId, setOnActionListId] = useState(-1);

    const [project, setProject] = useState(null);
    const projectRef = useRef(null);
    const [showUserGroupDisplay, setShowUserGroupDisplay] = useState(false);
    const [showAddmember, setShowAddmember] = useState(false);



    const [editingListTitle, setEditingListTitle] = useState("");
    const [editingCardTitle, setEditingCardTitle] = useState("");

    const { id } = useParams();

    useEffect(() => {
        projectRef.current = project;
    }, [project])

    async function fetchProject() {
        const token = localStorage.getItem("auth_token");
        if (token) {
            axios.get(`http://localhost:8000/api/project/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Socket-ID": window.Echo.socketId()
                },
            })
                .then(response => {
                    const data = response.data.data;
                    data.lists.forEach((item) => {
                        item.isEditing = false;
                        item.isCreating = false;
                        item.cards.forEach((item) => {
                            item.isEditing = false;
                        });
                    });
                    data.lists.sort((a, b) => a.order - b.order);
                    data.lists.map((list) => {
                        list.cards.sort((a, b) => a.order - b.order);
                    })
                    setProject(data);
                    console.log(data);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    useEffect(() => {
        fetchProject();
    }, [])


    // project title
    const [editingProjectTitle, setEditingProjectTitle] = useState("");
    const [editingProject, setEditingProject] = useState("");
    const editProjectTitleInput = useRef();
    const projectTitleSpanRef = useRef();
    function openEditProjectTitle() {
        console.log('open')
        setEditingProject(true);
        setEditingProjectTitle(project.name);
        setTimeout(() => editProjectTitleInput.current.focus(), 0);
    }
    function syncUpdateProjectTitle() {
        setEditingProject(false);
        updateProject((p) => {
            p.name = editingProjectTitle;
            return true;
        })
        const token = localStorage.getItem("auth_token");
        if (token) {
            axios.put(`http://localhost:8000/api/project`, {
                id: project.id,
                name: editingProjectTitle
            }, {
                headers: { Authorization: `Bearer ${token}`, "X-Socket-ID": window.Echo.socketId() }
            })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }
    function closeEditProjectTitle(e) {
        if (!editingProject) return;
        if (!editProjectTitleInput.current.contains(e.target)) {
            setEditingProject(false);
        }
    }
    useEffect(() => {
        if (editingProject) {
            document.addEventListener('mousedown', closeEditProjectTitle)
        } else {
            document.removeEventListener("mousedown", () => closeEditProjectTitle);
        }
        return () => {
            document.removeEventListener("mousedown", () => closeEditProjectTitle);
        };
    }, [editingProject])
    useEffect(() => {
        if (projectTitleSpanRef.current && editProjectTitleInput.current) {
            const width = projectTitleSpanRef.current.offsetWidth;
            editProjectTitleInput.current.style.width = `${width}px`;
        }
    }, [editingProjectTitle]);
    // list

    function openCreateList() {
        enableCreateList();
        setEditingListTitle("");
        setTimeout(() => {
            listMenuRef.current.container.scrollLeft = listMenuRef.current.container.scrollWidth
        }, 0);
    }

    function syncCreateList() {
        toggleCreateList();

        const cloneProject = { ...project }

        const list = {
            id: "",
            projectId: project.id,
            name: newListTitle,
            order: project.lists.length,
            isCreating: false,
            isEditing: false,
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
                headers: { Authorization: `Bearer ${token}`, "X-Socket-ID": window.Echo.socketId() }
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

    function syncDeleteList() {
        const listId = selectListId.current;

        updateProject((p) => {
            p.lists = p.lists.filter(
                (list) => list.id !== listId
            );
            return true;
        })

        const token = localStorage.getItem("auth_token");
        if (token) {
            axios.delete(`http://localhost:8000/api/list/${listId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Socket-ID": window.Echo.socketId()
                },
                data: {
                    projectId: project.id
                }
            })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    function syncUpdateListTitle(listId) {
        updateProject((p) => {
            const list = p.lists.find((l) => l.id == listId);
            if (list == null) return false;

            if (list.name === editingListTitle) return false;

            list.name = editingListTitle;
            list.isEditing = false;

            return true;
        })
        isEditing.current = false;

        const token = localStorage.getItem("auth_token");
        if (token) {
            axios.put(`http://localhost:8000/api/list/${listId}`, {
                projectId: project.id,
                name: editingListTitle
            }, {
                headers: { Authorization: `Bearer ${token}`, "X-Socket-ID": window.Echo.socketId() }
            })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentCard, setCurrentCard] = useState(null);

    function openModal(cardId, listId) {
        const list = project.lists.find((list) => list.id === listId);
        if (!list) {
            console.error("List not found");
            return;
        }

        const card = list.cards.find((card) => card.id === cardId);
        if (!card) {
            console.error("Card not found");
            return;
        }

        console.log("Card found:", card);
        setCurrentCard(card);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
    }

    function saveCardChanges(updatedCard) {
        updateProject((p) => {
            const list = p.lists.find((l) => l.id === updatedCard.listId);
            if (list == null) return false;

            const cardIndex = list.cards.findIndex((c) => c.id === updatedCard.id);
            list.cards[cardIndex] = updatedCard;

            setEditingCardTitle(updatedCard.name);
        });

        const token = localStorage.getItem("auth_token");
        const listId = selectListId.current;
        if (token) {
            axios.put(`http://localhost:8000/api/card/${updatedCard.id}`, {
                projectId: project.id,
                name: updatedCard.name,
                description: updatedCard.description,
                fromListId: listId,
                toListId: listId
            }, {
                headers: { Authorization: `Bearer ${token}`, "X-Socket-ID": window.Echo.socketId() }
            })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
        }

        console.log(updatedCard);
    }

    // edit list title

    const editListTitleInput = useRef([]);
    const editIndex = useRef();
    const editListId = useRef();
    const isEditing = useRef(false);

    function openEditList(e, index, listId) {
        isEditing.current = true;
        const cloneProject = { ...project }
        const list = cloneProject.lists.find((list) => list.id == listId);

        setEditingListTitle(list.name);
        list.isEditing = true;
        setProject(cloneProject);
        editIndex.current = index;
        editListId.current = listId;

        setTimeout(() => editListTitleInput.current[index]?.focus(), 0);
    }

    function closeEditList(e) {
        if (!isEditing.current) return;
        if (!editListTitleInput.current[editIndex.current]?.contains(e.target)) {
            const cloneProject = { ...projectRef.current }
            const list = cloneProject.lists.find((list) => list.id == editListId.current);
            list.isEditing = false;
            setProject(cloneProject);
            isEditing.current = false;
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', closeEditList)
        return () => {
            document.removeEventListener("mousedown", () => closeEditList);
        };
    }, [])

    //

    function openCreateCard(listId) {
        setNewCardTitle("");
        const cloneProject = { ...project }
        let list = null;
        if (onActionListId != -1) {
            list = cloneProject.lists.find((list) => list.id == onActionListId);
            list.isCreating = false;
        }
        setOnActionListId(listId);
        list = cloneProject.lists.find((list) => list.id == listId);
        list.isCreating = true;
        setProject(cloneProject);
    }

    function closeCreateCard(listId) {
        setOnActionListId(-1);
        const cloneProject = { ...project }
        const list = cloneProject.lists.find((list) => list.id == listId);
        list.isCreating = false;
        setProject(cloneProject);
    }


    function syncCreateCard() {
        if (onActionListId === -1) return;
        if (newCardTitle === "") return;


        const cloneProject = { ...project }

        const list = cloneProject.lists.find((list) => list.id == onActionListId);
        if (list == null) return;

        list.isCreating = false;
        const card = {
            id: "",
            listId: list.id,
            name: newCardTitle,
            order: list.cards.length,
            isEditing: false
        }

        list.cards.push(card);

        const cardInput = {
            name: newCardTitle,
            listId: list.id,
            projectId: project.id
        }

        const token = localStorage.getItem("auth_token");
        if (token) {
            axios.post(`http://localhost:8000/api/card`, cardInput, {
                headers: { Authorization: `Bearer ${token}`, "X-Socket-ID": window.Echo.socketId() }
            })
                .then(response => {
                    console.log(response.data);
                    card.id = response.data.id;
                })
                .catch(error => {
                    console.error(error);
                });
        }

        setProject(cloneProject);
    }

    function syncDeleteCard() {
        const listId = selectListId.current;
        const cardId = selectCardId.current;

        updateProject((p) => {
            const list = p.lists.find((l) => l.id === listId);
            if (list === null) return false;
            list.cards = list.cards.filter((c) => c.id !== cardId);

            return true;
        })

        const token = localStorage.getItem("auth_token");
        if (token) {
            axios.delete(`http://localhost:8000/api/card/${cardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Socket-ID": window.Echo.socketId()
                },
                data: {
                    projectId: project.id
                }
            })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    function syncUpdateCardTitle(cardId, listId) {
        updateProject((p) => {
            const list = p.lists.find((l) => l.id == listId);
            if (list == null) return false;
            const card = list.cards.find((c) => c.id == cardId);

            if (card.name === editingCardTitle) return false;

            card.name = editingCardTitle;
            card.isEditing = false;

            return true;
        });

        setEditingCard(false)

        const token = localStorage.getItem("auth_token");
        if (token) {
            axios.put(`http://localhost:8000/api/card/${cardId}`, {
                projectId: project.id,
                name: editingCardTitle,
                fromListId: listId,
                toListId: listId
            }, {
                headers: { Authorization: `Bearer ${token}`, "X-Socket-ID": window.Echo.socketId() }
            })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    // edit card title
    const editCardTitleInput = useRef([]);
    const editCardRef = useRef({
        index: 0,
        listId: 0,
        cardId: 0,
    });

    const [editingCard, setEditingCard] = useState(false)

    function openEditCardTitle() {
        const cardId = selectCardId.current;
        const listId = selectListId.current;
        const index = selectCardIndex.current;

        updateProject((p) => {
            const list = p.lists.find((list) => list.id == listId);
            const card = list.cards.find((c) => c.id == cardId);

            card.isEditing = true;

            setEditingCardTitle(card.name);
        })

        editCardRef.current.index = index;
        editCardRef.current.listId = listId;
        editCardRef.current.cardId = cardId;
        setEditingCard(true);

        setTimeout(() => editCardTitleInput.current[index]?.focus(), 0);
    }

    function closeEditCardTitle(e) {
        if (!editingCard) return;
        if (!editCardTitleInput.current[editCardRef.current.index]?.contains(e.target)) {
            updateProject((p) => {
                const list = p.lists.find((list) => list.id == editCardRef.current.listId);
                const card = list.cards.find((c) => c.id == editCardRef.current.cardId);

                card.isEditing = false;
            })
            setEditingCard(false);
        }
    }

    useEffect(() => {
        if (editingCard) {
            document.addEventListener('mousedown', closeEditCardTitle)
        } else {
            document.removeEventListener("mousedown", () => closeEditCardTitle);
        }
        return () => {
            document.removeEventListener("mousedown", () => closeEditCardTitle);
        };
    }, [editingCard])

    // drag and drop
    const startIndexRef = useRef(0);
    const dragIdRef = useRef(0);
    const dragTypeRef = useRef(0);
    const listIdDragFrom = useRef(-1);

    const dragging = useRef(false);

    function onStartDrag(type, id, index, listId = -1) {
        if (dragging.current) return;
        dragging.current = true;
        startIndexRef.current = index;
        dragIdRef.current = id;
        dragTypeRef.current = type;
        if (type == 1) {
            listIdDragFrom.current = listId;
        }
    }

    function onEndDragList(index) {
        if (dragTypeRef.current != 0) return;

        if (!dragging.current) return;
        dragging.current = false;

        if (startIndexRef.current == index) {
            return;
        }

        const token = localStorage.getItem("auth_token");
        if (token) {
            axios.put(`http://localhost:8000/api/list/${dragIdRef.current}`, {
                projectId: project.id,
                order: index
            }, {
                headers: { Authorization: `Bearer ${token}`, "X-Socket-ID": window.Echo.socketId() }
            })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
        }

        const cloneProject = { ...project }
        const [item] = cloneProject.lists.splice(startIndexRef.current, 1);
        cloneProject.lists.splice(index, 0, item);

        cloneProject.lists.forEach((item, index) => {
            item.order = index;
        });

        setProject(cloneProject);
    }

    function onEndDragCard(index, targetListId) {
        if (dragTypeRef.current != 1) return;

        if (!dragging.current) return;
        dragging.current = false;

        if (listIdDragFrom.current == -1) return;

        if (startIndexRef.current == index && targetListId == listIdDragFrom.current) return;

        const token = localStorage.getItem("auth_token");
        if (token) {
            axios.put(`http://localhost:8000/api/card/${dragIdRef.current}`, {
                fromListId: listIdDragFrom.current,
                toListId: targetListId,
                projectId: project.id,
                order: index
            }, {
                headers: { Authorization: `Bearer ${token}`, "X-Socket-ID": window.Echo.socketId() }
            })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
        }

        const cloneProject = { ...project };
        const fromList = cloneProject.lists.find((list) => list.id == listIdDragFrom.current);
        const toList = cloneProject.lists.find((list) => list.id == targetListId);
        const [item] = fromList.cards.splice(startIndexRef.current, 1);
        toList.cards.splice(index, 0, item);

        toList.cards.forEach((item, index) => {
            item.order = index;
        });
        if (fromList.id != toList.id) {
            fromList.cards.forEach((item, index) => {
                item.order = index;
            });
        }

        setProject(cloneProject);
    }

    // Echo channel

    function updateProject(action) {
        const cloneProject = { ...projectRef.current };
        if (!action(cloneProject)) return;
        setProject(cloneProject);
    }


    function updateProjectFromChannel(projectUpdated) {
        console.log(projectUpdated);
        updateProject((p) => {
            p.name = projectUpdated.project.name;
            return true;
        })
    }

    function addListFromChannel(listCreated) {
        const list = {
            id: listCreated.list.id,
            projectId: listCreated.list.projectId,
            name: listCreated.list.name,
            order: listCreated.list.order,
            isCreating: false,
            isEditing: false,
            cards: []
        };
        updateProject((p) => {
            p.lists.push(list);
            return true;
        })
    }

    function deleteListFromChannel(listDeleted) {
        console.log("delete list");
        updateProject((p) => {
            p.lists = p.lists.filter((list) => list.id !== listDeleted.listId)
            return true;
        })
    }

    function updateListFromChannel(listUpdated) {
        console.log(listUpdated);
        updateProject((p) => {
            const list = p.lists.find((u) => u.id == listUpdated.list.id);
            if (list == null)
                return false;

            list.name = listUpdated.list.name;

            if (list.order != listUpdated.list.order) {
                const oldOrder = list.order;
                const newOrder = listUpdated.list.order;

                const [item] = p.lists.splice(oldOrder, 1);
                p.lists.splice(newOrder, 0, item);

                p.lists.forEach((item, index) => {
                    item.order = index;
                });
            }

            return true;
        })
    }

    function addCardFromChannel(cardCreated) {
        const card = {
            id: cardCreated.card.id,
            listId: cardCreated.card.listId,
            name: cardCreated.card.name,
            order: cardCreated.card.order,
            isEditing: false
        }

        updateProject((p) => {
            const list = p.lists.find((l) => l.id == cardCreated.card.listId);
            list.cards.push(card);
            return true;
        })
    }

    function deleteCardFromChannel(cardDeleted) {
        updateProject((p) => {
            const list = p.lists.find((l) => l.id == cardDeleted.listId);
            list.cards = list.cards.filter((c) => c.id != cardDeleted.cardId);

            return true;
        })
    }


    function updateCardFromChannel(cardUpdated) {
        updateProject((p) => {
            const fromList = p.lists.find((u) => u.id == cardUpdated.fromListId);
            const toList = p.lists.find((u) => u.id == cardUpdated.card.listId);
            const card = fromList?.cards.find((c) => c.id == cardUpdated.card.id);

            if (card == null || fromList == null || toList == null) return false;

            card.name = cardUpdated.card.name;
            card.listId = cardUpdated.card.listId;

            if (card.order != cardUpdated.card.order || (card.order == cardUpdated.card.order && fromList.id != toList.id)) {
                const [item] = fromList.cards.splice(card.order, 1);
                toList.cards.splice(cardUpdated.card.order, 0, item);

                toList.cards.forEach((item, index) => {
                    item.order = index;
                });
                if (fromList.id != toList.id) {
                    fromList.cards.forEach((item, index) => {
                        item.order = index;
                    });
                }
            }

            return true;
        })
    }

    const echoListenRef = useRef(false);
    useEffect(() => {
        if (echoListenRef.current) return;
        echoListenRef.current = true;
        window.Echo.private(`project.${id}`)
            .listen('ProjectUpdated', (e) => {
                updateProjectFromChannel(e)
            })
            .listen('CardListCreated', (e) => {
                addListFromChannel(e)
            })
            .listen('CardListDeleted', (e) => {
                deleteListFromChannel(e)
            })
            .listen('CardListUpdated', (e) => {
                updateListFromChannel(e)
            })
            .listen('CardCreated', (e) => {
                addCardFromChannel(e);
            })
            .listen('CardDeleted', (e) => {
                deleteCardFromChannel(e)
            })
            .listen('CardUpdated', (e) => {
                updateCardFromChannel(e);
            })
    }, [])


    // handle list menu

    const selectListId = useRef(0);
    const [listMenuState, setListMenuState] = useState({ isOpen: false, top: 0, left: 0 });
    const listMenuRef = useRef({
        menu: null,
        container: null,
        button: null,
    })

    const handleMenuOpen = (event, listId) => {
        selectListId.current = listId;

        listMenuRef.current.button = event.target;
        const rect = event.target.getBoundingClientRect();
        setListMenuState({
            isOpen: true,
            top: rect.bottom - window.scrollY,
            left: rect.left - window.scrollX,
        });
    };

    const handleMenuClose = () => {
        setListMenuState({ isOpen: false, top: 0, left: 0 });
    };

    const handleClickOutside = (event) => {
        if (!listMenuRef.current.menu.contains(event.target)
            && !listMenuRef.current.button.contains(event.target)
        ) {
            handleMenuClose();
        }
    };

    useEffect(() => {
        if (listMenuState.isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [listMenuState.isOpen]);


    // handle card menu

    const selectCardId = useRef(0);
    const selectCardIndex = useRef(0);
    const [cardMenuState, setCardMenuState] = useState({ isOpen: false, top: 0, left: 0 });
    const cardMenuRef = useRef({
        menu: null,
        container: null,
        button: null,
    })

    const handleCardMenuOpen = (event, index, cardId, listId) => {
        selectListId.current = listId;
        selectCardId.current = cardId;
        selectCardIndex.current = index;

        cardMenuRef.current.button = event.target;
        const rect = event.target.getBoundingClientRect();
        setCardMenuState({
            isOpen: true,
            top: rect.bottom - window.scrollY,
            left: rect.left - window.scrollX,
        });
    };

    const handleCardMenuClose = () => {
        setCardMenuState({ isOpen: false, top: 0, left: 0 });
    };

    const handleClickOutsideCard = (event) => {
        if (!cardMenuRef.current.menu.contains(event.target)
            && !cardMenuRef.current.button.contains(event.target)
        ) {
            handleCardMenuClose();
        }
    };

    useEffect(() => {
        if (cardMenuState.isOpen) {
            document.addEventListener("mousedown", handleClickOutsideCard);
        } else {
            document.removeEventListener("mousedown", handleClickOutsideCard);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutsideCard);
        };
    }, [cardMenuState.isOpen]);

    //

    const listsDisplay = project?.lists.map((list, index) => {
        return (
            <div
                key={list.id}
                onDrop={() => { onEndDragCard(0, list.id); onEndDragList(index) }}
                onDragEnter={(e) => e.preventDefault()}
                onDragOver={(e) => e.preventDefault()}
                className={"w-80 flex-shrink-0"}
            >
                <div
                    draggable
                    onDragStart={() => onStartDrag(0, list.id, index)}
                    className="p-3 bg-gray-100 rounded"
                >
                    <div className={"text-sm font-medium text-gray-900 w-full flex"}>
                        {!list.isEditing &&
                            <h3 onClick={(e) => openEditList(e, index, list.id)} className={"w-full py-1 px-2"}>{list.name}</h3>
                        }
                        {list.isEditing &&
                            <input
                                ref={(ref) => { editListTitleInput.current[index] = ref }}
                                type="text"
                                className={"w-full py-1 px-2 mr-1"}
                                value={editingListTitle}
                                onChange={(e) => setEditingListTitle(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') syncUpdateListTitle(list.id) }}
                            />
                        }
                        <button
                            onClick={(e) => handleMenuOpen(e, list.id)}
                            className="px-1 hover:bg-gray-300 rounded"
                        >
                            <svg className="w-[24px] h-[24px] text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeWidth="3" d="M6 12h.01m6 0h.01m5.99 0h.01" />
                            </svg>
                        </button>
                    </div>
                    <ul className={"mt-2 space-y-3"}>
                        {
                            list.cards.map((card, index2) => {
                                return (
                                    <li
                                        onDrop={() => onEndDragCard(index2, list.id)}
                                        onDragEnter={(e) => e.preventDefault()}
                                        onDragOver={(e) => e.preventDefault()}
                                        key={index2}
                                        className={""}
                                    >
                                        <div
                                            draggable
                                            onDragStart={() => onStartDrag(1, card.id, index2, list.id)}
                                            className={"lock p-3 bg-white rounded shadow group"}
                                        >
                                            <div className={"flex justify-between items-center h-7"}>
                                                {!card.isEditing &&
                                                    <p className={"block text-sm font-medium leading-snug text-gray-900 text-left cursor-pointer"} onClick={() => openModal(card.id, list.id)}>
                                                        {card.name}
                                                    </p>
                                                }
                                                {card.isEditing &&
                                                    <input
                                                        ref={(ref) => { editCardTitleInput.current[index2] = ref }}
                                                        className="w-full text-sm font-medium leading-snug text-gray-900 text-left"
                                                        type="text"
                                                        value={editingCardTitle}
                                                        onChange={(e) => setEditingCardTitle(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') syncUpdateCardTitle(card.id, list.id) }}
                                                    />
                                                }
                                                <button
                                                    onClick={(e) => handleCardMenuOpen(e, index2, card.id, list.id)}
                                                    className={`p-1 rounded-lg hover:bg-gray-200 ${card.isEditing ? "" : "hidden group-hover:block"}`}
                                                >
                                                    <svg className="w-5 h-5 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className={"flex items-baseline mt-2"}>
                                            <span>
                                            {
                                                card.users.map((user, index3) => { return (
                                                    <img
                                                        key={index3}
                                                        className={"h-6 w-6 rounded-full"}
                                                        src={`http://localhost:8000/storage/${user.avatar}`} alt="avatar"
                                                        onError={(e) => {
                                                            e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e";
                                                        }}
                                                    />
                                                )})
                                            }
                                            </span> 
                                            </div>
                                        </div>
                                    </li>
                                )
                            })
                        }

                        {list.isCreating &&
                            <li className={""}>
                                <a href="#" className={"block p-5 bg-white rounded shadow"}>
                                    <div className={"flex justify-between"}>
                                        <input
                                            className={"w-full text-sm leading-8 text-gray-900 text-left bg-gray-100 px-1 rounded border"}
                                            type="text"
                                            placeholder="New card name"
                                            value={newCardTitle}
                                            onChange={(e) => setNewCardTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className={"flex justify-end items-center mt-2 space-x-2"}>
                                        <button
                                            onClick={() => closeCreateCard(list.id)}
                                            type="button"
                                            className={"px-2 py-1 h-8 leading-tight inline-flex items-center rounded hover:bg-gray-300"}
                                        >
                                            <svg className="w-5 h-5 text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => syncCreateCard()}
                                            type="button"
                                            className={"px-2 py-1 h-8 leading-tight inline-flex items-center text-white bg-gray-800 rounded hover:bg-gray-700"}
                                        >
                                            <span className={"text-sm font-medium"}>Add card</span>
                                        </button>
                                    </div>
                                </a>
                            </li>
                        }

                        {!list.isCreating &&
                            <li className={""}>
                                <button
                                    onClick={() => openCreateCard(list.id)}
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
            </div>
        )
    })

    return (
        <>
            <div className={"flex flex-col h-full overflow-auto"}>
                <header className={"px-6 border-b border-gray-200"}>
                    <div className={"flex justify-between items-center py-2"}>
                        <div className={"flex"}>
                            {!editingProject ?
                                <h2
                                    onClick={() => openEditProjectTitle()}
                                    className={"text-2xl font-semibold text-gray-900 leading-tight hover:cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"}
                                >{project?.name}</h2>
                                :
                                <span
                                    ref={projectTitleSpanRef}
                                    className="text-2xl font-semibold absolute invisible leading-tight whitespace-pre px-2 py-1"
                                >
                                    {editingProjectTitle || " "}
                                </span>
                            }
                            <input
                                ref={editProjectTitleInput}
                                className={`block text-2xl font-semibold text-gray-900 leading-tight px-2 py-1 rounded ${editingProject ? "" : "hidden"}`}
                                type="text"
                                value={editingProjectTitle}
                                onChange={(e) => setEditingProjectTitle(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') syncUpdateProjectTitle() }}
                                style={{ width: "auto", minWidth: "50px" }}
                            />
                            <div className={"flex ml-6"}>
                                {project?.members.map(member => { return (
                                    <span key={member.id} className={"-ml-2 rounded-full border-2 border-white"}>
                                        <img
                                            className={"h-6 w-6 rounded-full object-cover"}
                                            src={`http://localhost:8000/storage/${member.avatar}`} alt="avatar"
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e";
                                            }}
                                        />
                                    </span>
                                )})}
                            </div>
                        </div>
                        <div className={"flex"}>
                            <button className={"px-2 py-1 bg-white shadow rounded mr-2"}
                                onClick={() => setShowAddmember(!showAddmember)
                                }
                            >
                                Add Member
                            </button>
                            {showAddmember && <Addmember id={project.id} onClose={() => setShowAddmember(false)} />}
                            <button className={"px-2 py-1 bg-white shadow rounded"}
                                onClick={() => setShowUserGroupDisplay(!showUserGroupDisplay)
                                }
                            >
                                {showUserGroupDisplay ? "Hide Members" : "Show Members"}
                            </button>
                            {showUserGroupDisplay && <UserGroupDisplay id={project.id} onClose={() => setShowUserGroupDisplay(false)} />}
                            <button
                                onClick={() => { openCreateList() }}
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

                <main ref={(e) => { listMenuRef.current.container = e }} className={"flex-1 p-3 overflow-auto"}>

                    <div className="inline-flex space-x-3 h-full">
                        {listsDisplay}

                        {createList &&
                            <div className={"flex-shrink-0 w-80"}>
                                <div className="bg-gray-100 p-3 rounded">
                                    <input
                                        className="leading-8 text-sm font-medium text-gray-900 p-1 w-full border rounded"
                                        type="text"
                                        placeholder="New list title"
                                        value={newListTitle}
                                        onChange={(e) => setNewListTitle(e.target.value)}
                                    />
                                    <div className={"flex justify-end items-center mt-2 space-x-2"}>
                                        <button
                                            onClick={() => { toggleCreateList(); setNewListTitle("") }}
                                            type="button"
                                            className={"px-2 py-1 h-8 leading-tight inline-flex items-center rounded hover:bg-gray-300"}
                                        >
                                            <svg className="w-5 h-5 text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
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
                    </div>

                    {listMenuState.isOpen &&
                        <div
                            className="fixed mr-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-40"
                            style={{
                                top: `${listMenuState.top}px`,
                                left: `${listMenuState.left}px`,
                            }}
                        >
                            <ul
                                ref={(e) => { listMenuRef.current.menu = e }}
                                className="py-2 text-sm text-gray-700" aria-labelledby="dropdownMenuIconButton"
                            >
                                <li>
                                    <button
                                        onClick={() => { handleMenuClose(); syncDeleteList() }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >Delete</button>
                                </li>
                            </ul>
                        </div>
                    }

                    {cardMenuState.isOpen &&
                        <div
                            className="fixed mr-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-40"
                            style={{
                                top: `${cardMenuState.top}px`,
                                left: `${cardMenuState.left}px`,
                            }}
                        >
                            <ul
                                ref={(e) => { cardMenuRef.current.menu = e }}
                                className="py-2 text-sm text-gray-700" aria-labelledby="dropdownMenuIconButton"
                            >
                                <li>
                                    <button
                                        onClick={() => { handleCardMenuClose(); openEditCardTitle() }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >Edit title</button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => { handleCardMenuClose(); syncDeleteCard() }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >Delete</button>
                                </li>
                            </ul>
                        </div>
                    }
                </main>

                {isModalOpen && currentCard && (
                    <EditCardModal
                        isOpen={isModalOpen}
                        card={currentCard}
                        onClose={closeModal}
                        onSave={saveCardChanges}
                    />
                )}

            </div>
        </>
    );
}

export default KanbanBoard;