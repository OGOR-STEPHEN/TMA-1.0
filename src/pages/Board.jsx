import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { auth } from "../firebase/config";
import { fetchTasksFromDB, updateTaskInDB } from "../firebase/tasks";
import { onAuthStateChanged } from "firebase/auth";

const DraggableTask = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
    });
    const style = {
        transform: CSS.Translate.toString(transform),
        background: "rgba(255,255,255,0.05)",
        padding: "12px",
        marginBottom: "8px",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.05)",
        cursor: "grab",
    };
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {task.text}
        </div>
    );
};

const DroppableColumn = ({ id, title, tasks }) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} style={styles.column}>
            <h3 style={styles.columnTitle}>{title}</h3>
            <div style={styles.columnContent}>
                {tasks.map((task) => (
                    <DraggableTask key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
};

const Board = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchTasksFromDB(user.uid, setTasks);
            }
        });
        return unsub;
    }, []);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            // active.id is task id
            // over.id is column id (todo, in-progress, done)
            const task = tasks.find(t => t.id === active.id);
            if (task && task.status !== over.id) {
                updateTaskInDB(active.id, { status: over.id });
            }
        }
    };

    const todoTasks = tasks.filter(t => t.status === "todo" || (!t.status && !t.completed));
    const inProgressTasks = tasks.filter(t => t.status === "in-progress");
    const doneTasks = tasks.filter(t => t.status === "done" || t.completed);

    return (
        <Layout>
            <div style={styles.header}>
                <h1>Kanban Board</h1>
            </div>

            <DndContext onDragEnd={handleDragEnd}>
                <div style={styles.board}>
                    <DroppableColumn id="todo" title="To Do" tasks={todoTasks} />
                    <DroppableColumn id="in-progress" title="In Progress" tasks={inProgressTasks} />
                    <DroppableColumn id="done" title="Done" tasks={doneTasks} />
                </div>
            </DndContext>
        </Layout>
    );
};

const styles = {
    header: { marginBottom: "20px" },
    board: {
        display: "flex",
        gap: "20px",
        height: "calc(100vh - 140px)",
        overflowX: "auto"
    },
    column: {
        flex: "0 0 300px",
        background: "rgba(0,0,0,0.2)",
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
    },
    columnTitle: {
        marginBottom: "16px",
        fontSize: "18px",
        color: "rgba(255,255,255,0.7)",
    },
    columnContent: {
        flex: 1,
        overflowY: "auto",
    }
};

export default Board;
