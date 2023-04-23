import React, { useState, useEffect } from "react";
import { useParams, useLoaderData } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import MultipleSelectChip from "../components/selectChip";
import BasicSelect from "../components/basicSelect";
import { BASE_URL } from "../constants";
const socket = io.connect(BASE_URL);

export async function loader() {
  const { data } = await axios.get(`${BASE_URL}/notes`);
  return {
    fetchedNotes: data.data.notes,
    priorities: data.data.priorities,
    users: data.data.users,
  };
}

const fetchNotes = async (filterData) => {
  const { data } = await axios.post(`${BASE_URL}/filters`, filterData);
  return data;
};

const Notes = () => {
  const { fetchedNotes, priorities, users } = useLoaderData();
  console.log("api data", fetchedNotes, priorities, users);
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState("");
  console.log("priority", priority);
  const [notes, setNotes] = useState(fetchedNotes);
  const [isEdit, setIsEdit] = useState({ value: false, id: "" });
  const [editVal, setEditVal] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [selectedUsers, setSelectedUsers] = React.useState([]);
  const [selectedPriorities, setSelectedPriorities] = React.useState([]);

  const [sort, setSort] = React.useState("");
  console.log("sort", sort);
  console.log("selected", selectedUsers, selectedPriorities);
  const { userId } = useParams();

  const handleEditSave = async (note) => {
    if (editVal.trim() !== "") {
      note.history.unshift({
        note: note.note,
        contributedBy: note.contributedBy[note.contributedBy.length - 1],
        id: new Date(),
      });
      note.history.length > 5 && note.history.pop();

      const noteData = {
        ...note,
        note: editVal,
        priority: editPriority,
        contributedBy: [...note.contributedBy, userId],
        updatedAt: new Date(),
        history: note.history,
      };

      await socket.emit("edit_note", noteData);
      setIsEdit({ value: false, id: "" });
      setEditVal("");
      setEditPriority("");
    }
  };

  const handleDelete = async ({ id }) => {
    const deleteData = {
      room: "app",
      id,
    };
    await socket.emit("delete_note", deleteData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (note.trim() !== "") {
      const noteData = {
        room: "app",
        createdBy: userId,
        contributedBy: [userId],
        note,
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [],
        priority,
      };

      console.log(noteData);

      await socket.emit("add_note", noteData);
      setNote("");
      setPriority("");
    }
  };

  useEffect(() => {
    socket.on("list_note", (data) => {
      console.log("data", data);
      setNotes(data);
    });
    return () => socket.off("list_note");
  }, [socket]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataNotes = await fetchNotes({
          selectedUsers,
          selectedPriorities,
          sort,
        });
        console.log("dataNotes", dataNotes);

        setNotes(dataNotes.data);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchData();
  }, [selectedUsers, selectedPriorities, sort]);

  return (
    <>
      <h1>Notes</h1>

      <h5>Logged in as: {userId}</h5>
      <div>
        <form onSubmit={handleSubmit}>
          <h3>Add a Note</h3>

          <input
            type="text"
            placeholder="Note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <BasicSelect
            items={["High", "Medium", "Low"]}
            name="Priority"
            select={priority}
            setSelect={setPriority}
          />
          <button type="submit">Add</button>
        </form>
      </div>

      <div>
        <div>Filters: </div>
        <MultipleSelectChip
          items={users.map((user) => user.name)}
          name="Users"
          selected={selectedUsers}
          setSelected={setSelectedUsers}
        />
        <MultipleSelectChip
          items={priorities}
          name="Priority"
          selected={selectedPriorities}
          setSelected={setSelectedPriorities}
        />
        <div>Sort by:</div>
        <BasicSelect
          items={["Alphabetical Order", "Created At", "Updated At"]}
          name="Sort"
          select={sort}
          setSelect={setSort}
        />
        <ul>
          {notes?.length ? (
            notes.map((note) => (
              <li key={note.createdAt}>
                {isEdit.value && isEdit.id === note.createdAt ? (
                  <>
                    <input
                      type="text"
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                    />

                    <BasicSelect
                      items={["High", "Medium", "Low"]}
                      name="Priority"
                      select={editPriority}
                      setSelect={setEditPriority}
                    />
                    <button onClick={() => handleEditSave(note)}>Save</button>
                  </>
                ) : (
                  <>
                    <h4>{note.note}</h4>
                    <h6>{note.priority}</h6>
                    <div>{`Contributed By: ${[
                      ...new Set(note.contributedBy),
                    ].join(", ")}`}</div>
                    <h6>History</h6>
                    <ul>
                      {note.history.map((el) => (
                        <li
                          key={el.id}
                        >{`Note: ${el.note}, ContributedBy: ${el.contributedBy}`}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        setIsEdit({ value: true, id: note.createdAt });
                        setEditVal(note.note);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete({ id: note.createdAt })}
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))
          ) : (
            <h4>No Notes Found</h4>
          )}
        </ul>
      </div>
    </>
  );
};

export default Notes;
