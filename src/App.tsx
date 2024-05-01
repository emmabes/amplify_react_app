// from setup
import "./App.css";

// connecting frontend to api
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";

import { createTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import { type CreateTodoInput, type Todo } from "./API";

// adding authentication
import {
  withAuthenticator,
  Button,
  Heading,
  Text,
  View
} from '@aws-amplify/ui-react';
import { type AuthUser } from "aws-amplify/auth";
import { type UseAuthenticator } from "@aws-amplify/ui-react-core";
import "@aws-amplify/ui-react/styles.css";

const initialState: CreateTodoInput = { name: "", description: "" };
const client = generateClient();

type AppProps = {
  signOut?: UseAuthenticator["signOut"]; //() => void;
  user?: AuthUser;
};

const App: React.FC<AppProps> = ({ signOut, user }) => {
  const [formState, setFormState] = useState<CreateTodoInput>(initialState);
  const [todos, setTodos] = useState<Todo[] | CreateTodoInput[]>([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos,
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log("error fetching todos: ", err)
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await client.graphql({
        query: createTodo,
        variables: {
          input: todo,
        },
      });
    } catch (err) {
      console.log("error creating todo: ", err)
    }
  }

  return (
    <View style={styles.container}>
      <Heading level={1} style={styles.Heading}>Hello {user ? user.username: 'Stranger'}</Heading>
      <Button onClick={signOut} style={styles.signOut}>Sign out</Button>
      <Heading level={2} style={styles.Heading}>Amplify Todos</Heading>
      <input
        onChange={(event) =>
          setFormState({ ...formState, name: event.target.value })
        }
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={(event) =>
          setFormState({ ...formState, description: event.target.value })
        }
        style={styles.input}
        value={formState.description as string}
        placeholder="Description"
      />
      <Button style={styles.button} onClick={addTodo}>
        Create Todo
      </Button>
      {todos.map((todo, index) => (
        <View key={todo.id ? todo.id : index} style={styles.todo}>
          <Text style={styles.todoName}>{todo.name}</Text>
          <Text style={styles.todoDescription}>{todo.description}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = {
  p: {
    color:"white",
  },
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold", color: "#ddd" },
  todoDescription: { marginBottom: 0, color: "#ccc" },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
  },
  Heading: {color: "#ddd"},
  signOut: {backgroundColor: "#555", color: "#ddd"}

} as const;

export default withAuthenticator(App);