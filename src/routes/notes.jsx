import React, { useState, useEffect } from "react";
import { useParams, useLoaderData } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import MultipleSelectChip from "../components/selectChip";
import BasicSelect from "../components/basicSelect";
import { BASE_URL } from "../constants";
import ResponsiveAppBar from "../components/AppBar";
import {
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ControlledAccordions from "../components/Accordian";
const socket = io.connect(BASE_URL);

export async function loader(filterData) {
  const { data } = await axios.post(`${BASE_URL}/notes`, {
    ...filterData,
    limit: 10,
  });
  return {
    fetchedNotes: data.data.notes,
    priorities: data.data.priorities,
    users: data.data.users,
    count: data.data.count,
  };
}

const fetchNotes = async (filterData) => {
  const { data } = await axios.post(`${BASE_URL}/notes`, {
    ...filterData,
    limit: 10,
  });
  return data;
};

const fetchMoreData = async (notes, setNotes, setHasMore, count) => {
  if (notes.length >= count) {
    setHasMore(false);
    return;
  }
  const limit = parseInt(notes.length) * 10 + 10;

  const { data } = await axios.post(`${BASE_URL}/notes`, { limit });
  setNotes(data.data.notes);
};

const Notes = () => {
  const { fetchedNotes, priorities, users, count } = useLoaderData();
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
  const [hasMore, setHasMore] = useState(count > 10 ? true : false);
  const { userId } = useParams();

  const handleEditSave = async (note) => {
    if (editVal.trim() !== "" && editPriority !== "") {
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

    if (note.trim() !== "" && priority !== "") {
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

        setNotes(dataNotes.data.notes);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchData();
  }, [selectedUsers, selectedPriorities, sort]);

  return (
    <>
      <ResponsiveAppBar user={userId} />
      <Container sx={{ marginBottom: "1rem" }}>
        <Paper
          variant="outlined"
          rounded={true}
          elevation={5}
          sx={{
            borderRadius: "1rem",
            marginTop: "3rem",
            padding: "2rem",
            background: "#FDF4F5",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Typography variant="h5">Add a Note</Typography>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <TextField
                type="text"
                placeholder="Note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                label="Add Note"
                variant="outlined"
                sx={{ margin: "1rem 1rem", width: "90%" }}
              />

              <BasicSelect
                items={["High", "Medium", "Low"]}
                name="Priority"
                select={priority}
                setSelect={setPriority}
              />
            </div>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ marginTop: "1rem" }}
            >
              Add
            </Button>
          </form>
        </Paper>
      </Container>

      <Container>
        <Paper
          variant="outlined"
          rounded={true}
          elevation={5}
          sx={{
            marginTop: "3rem",
            padding: "2rem",
            borderRadius: "1rem",
            background: "#FDF4F5",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Filters: </Typography>
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
            <Typography variant="h6">Sort by:</Typography>
            <BasicSelect
              items={["Alphabetical Order", "Created At", "Updated At"]}
              name="Sort"
              select={sort}
              setSelect={setSort}
            />
          </div>
          <ul>
            <InfiniteScroll
              dataLength={notes.length} //This is important field to render the next data
              next={() => fetchMoreData(notes, setNotes, setHasMore, count)}
              hasMore={hasMore}
              loader={
                <div style={{ textAlign: "center", margin: "1rem" }}>
                  <CircularProgress />
                </div>
              }
              endMessage={
                <p style={{ textAlign: "center" }}>
                  <b>Yay! You have seen it all</b>
                </p>
              }
            >
              {notes?.length ? (
                notes.map((note) => (
                  <ControlledAccordions
                    note={note}
                    isEdit={isEdit}
                    setIsEdit={setIsEdit}
                    editVal={editVal}
                    setEditVal={setEditVal}
                    editPriority={editPriority}
                    setEditPriority={setEditPriority}
                    handleEditSave={handleEditSave}
                    handleDelete={handleDelete}
                    key={note._id}
                  />
                ))
              ) : (
                <h4>No Notes Found</h4>
              )}
            </InfiniteScroll>
          </ul>
        </Paper>
      </Container>
    </>
  );
};

export default Notes;
