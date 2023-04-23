import React, { useState, useEffect } from "react";
import { useParams, useLoaderData } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
// import InfiniteScroll from "react-infinite-scroll-component";
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
    count: data.data.count,
  };
}

const fetchNotes = async (filterData) => {
  const { data } = await axios.post(`${BASE_URL}/filters`, filterData);
  return data;
};

// let skip = 0;
// const fetchMoreData = async (setNotes, notes, setHasMore, count) => {
//   if (notes >= count) setHasMore(false);
//   const { data } = await axios.get(`${BASE_URL}/notes/${skip}`);
//   console.log("more fetched data", data.data.notes);
//   setNotes([...notes, ...data.data.notes]);
//
//   skip += 10;
// };

const Notes = () => {
  const { fetchedNotes, priorities, users /* count */ } = useLoaderData();
  console.log("api data", fetchedNotes, priorities, users);
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState("");
  console.log("priority", priority);
  const [notes, setNotes] = useState(fetchedNotes);
  console.log("notes", notes);
  const [isEdit, setIsEdit] = useState({ value: false, _id: "" });
  const [editVal, setEditVal] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [selectedUsers, setSelectedUsers] = React.useState([]);
  const [selectedPriorities, setSelectedPriorities] = React.useState([]);

  const [sort, setSort] = React.useState("");
  // const [hasMore, setHasMore] = useState(count > 10 ? true : false);
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
      setIsEdit({ value: false, _id: "" });
      setEditVal("");
      setEditPriority("");
    }
  };

  const handleDelete = async ({ _id }) => {
    const deleteData = {
      room: "app",
      _id,
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
    if (selectedUsers.length && selectedPriorities.length && sort !== "") {
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
    }
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
          {/* <InfiniteScroll */}
          {/*   dataLength={notes.length} //This is important field to render the next data */}
          {/*   next={() => fetchMoreData(setNotes, notes, setHasMore, count)} */}
          {/*   hasMore={hasMore} */}
          {/*   loader={<h4>Loading...</h4>} */}
          {/*   endMessage={ */}
          {/*     <p style={{ textAlign: "center" }}> */}
          {/*       <b>Yay! You have seen it all</b> */}
          {/*     </p> */}
          {/*   } */}
          {/* > */}
          {notes?.length ? (
            notes.map((note) => (
              <li key={note.createdAt}>
                {isEdit.value && isEdit._id === note._id ? (
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
                        setIsEdit({ value: true, _id: note._id });
                        setEditVal(note.note);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete({ _id: note._id })}>
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))
          ) : (
            <h4>No Notes Found</h4>
          )}
          {/* </InfiniteScroll> */}
        </ul>
      </div>
    </>
  );
};

export default Notes;
