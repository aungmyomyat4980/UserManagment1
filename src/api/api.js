import { message } from "antd";
import { Messages } from "../data/message";
import axios from "axios";
const API_BASE_URL = "http://localhost:8000";

// 新しいユーザーを作成する
// パラメータ : ユーザーデータ
// 戻り値 : ユーザーデータ
const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    message.error(Messages.M001);
    console.error("Error creating user:", error);
  }
};

// すべてのユーザーを取得する
// パラメータ : なし
// 戻り値 : ユーザーデータ
const getUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`);
    const data = await response.json();
    return data;
  } catch (error) {
    message.error(Messages.M001);
    console.error("Error getting users:", error);
  }
};

// ユーザーを更新する
// パラメータ : ユーザーId, ユーザーデータ
// 戻り値 : ユーザーデータ
const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/user/${userId}`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

// ユーザーを削除する
// パラメータ : ユーザーId, ユーザーデータ
// 戻り値 : ユーザーデータ
const deleteUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

// すべてのチームを取得する
// パラメータ : なし
// 戻り値 : チームデータ
const getTeams = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/team`);
    const data = await response.json();
    return data;
  } catch (error) {
    message.error(Messages.M001);
    console.error("Error getting team:", error);
  }
};

export { createUser, getUsers, updateUser, deleteUser, getTeams };
