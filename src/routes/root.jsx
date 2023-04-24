import { Card, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import ResponsiveAppBar from "../components/AppBar";
import profile from "../assets/profile_placeholder.jpg";

const users = [
  { name: "User 1", userId: "user01" },
  { name: "User 2", userId: "user02" },
  { name: "User 3", userId: "user03" },
  { name: "User 4", userId: "user04" },
];
const Root = () => {
  return (
    <div>
      <ResponsiveAppBar />
      <Typography variant="h1" mt={10} sx={{ textAlign: "center" }}>
        Select User
      </Typography>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {users.map((user) => (
          <Link to={`/notes/${user.userId}`}>
            <Paper
              key={user.userId}
              sx={{
                height: "250px",
                width: "200px",
                textAlign: "center",
                textJustify: "auto",
                margin: "2rem",
                background: "#BA90C6",
              }}
            >
              <img src={profile} alt="profile" width="100%" />
              <Typography variant="h6">{user.name}</Typography>
            </Paper>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Root;
