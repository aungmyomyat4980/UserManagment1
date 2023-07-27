import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Table,
  message,
} from "antd";
import styles from "../../styles/Teamsetting.module.css";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { getTeams, getUsers, updateUser } from "../../api/api";
import { Messages } from "../../data/message";
import { Helmet } from "react-helmet";

// チーム設定コンポーネントの定義
// パラメータ：ログインユーザー, フォーム
const Teamsetting = ({ loginUser, form }) => {
  // ステート変数の定義
  const [userData, setUserData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [searchteamData, setsearchteamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [clickUsers, setClickUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, setUser] = useState([]);
  const [teamSearchInput, setTeamSearchInput] = useState("");
  const [searchValues, setSearchValues] = useState([]);
  const pageSize = 6;
  const [currentPage, setCurrentPage] = useState(1); // 現在のページのステート変数
  // 選択されたチームのステート変数
  const [selectedTeamFromSelectBox, setSelectedTeamFromSelectBox] =
    useState("");

  // コンポーネントがマウントされたときにユーザーデータとチームデータの取得の処理
  useEffect(() => {
    fetchUsers();
    return () => {
      setUserData([]);
      setTeamData([]);
      setSelectedUsers([]);
      setClickUsers([]);
      setSearchValues([]);
    };
  }, []);

  // ユーザーデータとチームデータを取得する非同期関数の定義
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      const teams = await getTeams();
      const filteredData = users.filter((user) => user.del_flg === "0");
      const filteredTeam = teams.filter((team) => team.del_flg === "0");
      setTeamData(filteredTeam);
      setUserData(filteredData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  // ユーザーがクリックされたときのイベントハンドラの処理
  const handleClickUser = (userId) => {
    // クリックされたユーザーデータを取得
    const clickedUser = userData.find((user) => user._id === userId);

    // クリックされたユーザーデータが存在する場合
    if (clickedUser) {
      // 選択されたユーザーがすでに選択済みかどうかを確認
      const userAlreadySelected = selectedUsers.some(
        (selectedUser) => selectedUser._id === userId
      );
      // ユーザーが選択されていない場合
      if (!userAlreadySelected) {
        // 新しいユーザーデータを選択されたユーザーに追加
        setSelectedUsers((prevSelectedUsers) => [
          ...prevSelectedUsers,
          clickedUser,
        ]);
      }
      // ユーザーが選択されている場合
      else {
        // 選択されたユーザーデータを選択されたユーザーから削除
        setSelectedUsers((prevSelectedUsers) =>
          prevSelectedUsers.filter((user) => user._id !== userId)
        );
      }
    }
  };

  // チーム名検索のイベントハンドラの処理
  const onSearch = (value) => {
    // チーム名検索の入力値をステートにセット
    setTeamSearchInput(value);
    // 入力値を小文字に変換
    const lowerCaseSearch = value.toLowerCase();
    // チームデータを検索して結果を更新
    const filteredTeams = teamData.filter((team) =>
      team.team_name.toLowerCase().includes(lowerCaseSearch)
    );
    // If the search keyword is 'なし', manually add the 'なし' team to the filtered results
    if (value === "なし") {
      setsearchteamData([noneTeam, ...filteredTeams]);
    } else {
      // フィルタリングされたチームデータをステートにセット
      setsearchteamData(filteredTeams);
    }
  };

  // フォームの送信イベントハンドラの処理
  const handleFormSubmit = async (values) => {
    // 選択されたユーザーのデータを更新するための新しいデータを作成
    const newUserData = clickUsers.map((user) => ({
      ...user,
      del_flg: "0",
      update_user: loginUser[0]._id,
      update_datetime: new Date().toISOString(),
      team_name: selectedTeamFromSelectBox,
    }));

    // Check if the selected team has users before submitting the form
    if (newUserData.length === 0) {
      message.error(Messages.M022);
      return;
    }

    try {
      // 選択されたユーザーデータを更新するAPIを呼び出す
      for (const user of newUserData) {
        await updateUser(user._id, user);
      }
    } catch (error) {
      console.error("Error updating users:", error);
    }
    // 成功メッセージを表示する
    message.success(Messages.M008);
    // ユーザーデータとチームデータの再取得
    fetchUsers();
    // クリックされたユーザーのステートを初期化
    //setClickUsers([]);

    setSelectedUsers([]);
    // 選択されたチームのステートを初期化
    setSelectedTeamFromSelectBox("");
    // Hide the modal after successful form submission
    setIsModalVisible(false);
  };

  // チーム名検索の送信イベントハンドラの処理
  const handleSearchSubmit = async (values) => {
    const selectedTeam = values.teamSelect === "なし" ? "" : values.teamSelect;
    const newSearchValue = values.teamSearchInput;

    setSearchValues((prevSearchValues) => [
      ...prevSearchValues,
      newSearchValue,
    ]);

    let filteredUserData;
    if (searchValues.includes("なし")) {
      filteredUserData = userData.filter(
        (user) => !user.team_name || searchValues.includes(user.team_name)
      );
    } else {
      filteredUserData = userData.filter(
        (user) => searchValues.includes(user.team_name) && user.team_name
      );
    }
    setUser(filteredUserData);
    setClickUsers([]);
    setIsModalVisible(false);

    if (filteredUserData.length === 0) {
      message.warning(Messages.M022);
      return;
    }
  };

  // 右矢印ボタンクリック時の処理
  const handleRightClick = () => {
    if (!loading) {
      setClickUsers((prevUsers) => {
        const uniqueSelectedUsers = selectedUsers.filter(
          (selectedUser) => !prevUsers.includes(selectedUser)
        );
        return [...prevUsers, ...uniqueSelectedUsers];
      });
      setSelectedUsers([]);
    }
  };

  // 左矢印ボタンクリック時の処理
  const handleLeftClick = () => {
    if (!loading) {
      setClickUsers((prevClickUsers) => {
        const updatedClickUsers = prevClickUsers.filter(
          (user) =>
            !selectedUsers.some((selectedUser) => selectedUser._id === user._id)
        );
        return updatedClickUsers;
      });
      setSelectedUsers([]);
    }
  };

  // チェックボックスの変更時の処理
  const onChange = (e, record) => {
    if (e.target.checked) {
      setSearchValues((prevSearchValues) => [
        ...prevSearchValues,
        record.team_name,
      ]);
    } else {
      setSearchValues((prevSearchValues) =>
        prevSearchValues.filter((value) => value !== record.team_name)
      );
    }
  };

  // モーダルの表示処理
  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  // テーブルのカラム定義
  const columns = [
    {
      title: () => <div style={{ textAlign: "center" }}>番号</div>,
      dataIndex: "id",
      key: "id",
      render: (_, record, index) => (
        <Checkbox onChange={(e) => onChange(e, record, index)}>
          {index + 1 + (currentPage - 1) * pageSize}
        </Checkbox>
      ),
    },
    {
      title: () => <div style={{ textAlign: "center" }}>チーム名</div>,
      dataIndex: "team_name",
      key: "team_name",
    },
  ];

  // ページが変更されたときに他のアクションを実行する
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // "なし" チームの静的データ
  const noneTeam = {
    id: "none",
    team_name: "なし",
  };

  // チーム検索用のデータを準備する
  let combinedTeamData;
  if (teamSearchInput.length === 0) {
    combinedTeamData = [noneTeam, ...teamData];
  } else {
    combinedTeamData = searchteamData;
  }

  // チーム選択のオプションを作成
  const teamOptions = teamData.map((team) => ({
    value: team.team_name,
    label: team.team_name,
  }));

  return (
    <>
      <Helmet>
        <title>User Management</title>
        <link rel="icon" type="image/png" href="/path/to/favicon.png" />
      </Helmet>
      <div className={styles["teamsetting-main"]}>
        <div className={styles["teamsetting-container"]}>
          <div className={styles["teamsetting-search"]}>
            <label className={styles["teamsetting-label"]}>チーム名 : </label>
            <SearchOutlined
              style={{
                background: "blue",
                color: "#fff",
                padding: "5px",
                fontSize: "20px",
                cursor: "pointer",
                borderRadius: "5px",
                marginLeft: "20px",
              }}
              onClick={handleShowModal}
            />
          </div>
          <Modal
            title="チーム名検索"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            centered
            form={form} // Pass the form instance to the Modal
          >
            <Form>
              <Form.Item label="チーム名">
                <Input
                  style={{ width: "100%" }}
                  placeholder="検索条件入力"
                  name="teamSearchInput"
                  value={teamSearchInput}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </Form.Item>
              <Table
                dataSource={combinedTeamData}
                columns={columns}
                rowKey="id"
                pagination={{
                  pageSize,
                  onChange: handlePageChange,
                }}
              />
              <Form.Item style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={handleSearchSubmit}
                >
                  追加
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <div className={styles["div-color"]}>
            <Form form={form} onFinish={handleFormSubmit}>
              <Form.Item
                name="teamSelect"
                className={styles["usermanagement-form-item"]}
              >
                <div>
                  <div className={styles["selectbox-label"]}>
                    <label>チームに移動</label>
                  </div>
                  <Select
                    style={{ width: "250px" }}
                    className={styles["usermanagement-input"]}
                    options={teamOptions}
                    value={selectedTeamFromSelectBox}
                    onChange={(value) => {
                      form.setFieldsValue({ teamSelect: value });
                      setSelectedTeamFromSelectBox(value);
                    }}
                  />
                </div>
              </Form.Item>
              <Form.Item>
                <div className={styles["teamsetting-box-main"]}>
                  <p htmlFor="teamSelect" className={styles["user-name"]}>
                    ユーザー名 :{" "}
                  </p>
                  <div className={styles["teamsetting-box-container"]}>
                    <div className={styles["teamsetting-box"]}>
                      {loading ? (
                        <div>Loading...</div>
                      ) : (
                        <>
                          {user?.map((user) => (
                            <div
                              onClick={() => handleClickUser(user._id)}
                              className={`${styles["teamsetting-user"]} ${
                                clickUsers.find(
                                  (clickedUser) => clickedUser._id === user._id
                                )
                                  ? styles["none"]
                                  : ""
                              } ${
                                selectedUsers.find(
                                  (selectedUser) =>
                                    selectedUser._id === user._id
                                )
                                  ? styles["selected"]
                                  : ""
                              }`}
                              key={user?._id}
                            >
                              <div>{`${user.user_name} ${user.user_name_last}`}</div>
                              <div>{user.email}</div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles["teamsetting-btn-main"]}>
                    <div
                      className={styles["teamsetting-btn-container"]}
                      onClick={handleRightClick}
                    >
                      <DoubleRightOutlined
                        className={styles["teamsetting-btn"]}
                      />
                    </div>
                    <div
                      className={styles["teamsetting-btn-container"]}
                      onClick={handleLeftClick}
                    >
                      <DoubleLeftOutlined
                        className={styles["teamsetting-btn"]}
                      />
                    </div>
                  </div>
                  <div className={styles["teamsetting-box-container"]}>
                    <div className={styles["teamsetting-box"]}>
                      {clickUsers?.map((user) => (
                        <div
                          className={`${styles["teamsetting-user"]} ${
                            selectedUsers.some(
                              (selectedUser) => selectedUser._id === user._id
                            )
                              ? styles["selected"]
                              : ""
                          }`}
                          onClick={() => handleClickUser(user._id)}
                          key={user?._id}
                        >
                          <div>{`${user.user_name} ${user.user_name_last}`}</div>
                          <div>{user.email}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Form.Item>
              <Form.Item className={styles["submit-button"]}>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={
                    !selectedTeamFromSelectBox || clickUsers.length === 0
                  }
                >
                  決定
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Teamsetting;
