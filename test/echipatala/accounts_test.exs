defmodule Echipatala.AccountsTest do
  use Echipatala.DataCase

  alias Echipatala.Accounts

  describe "tbl_user" do
    alias Echipatala.Accounts.User

    import Echipatala.AccountsFixtures

    @invalid_attrs %{auto_password: nil, creator_id: nil, email: nil, gender: nil, name: nil, password: nil, phone: nil, status: nil, user_role: nil, user_type: nil, username: nil}

    test "list_tbl_user/0 returns all tbl_user" do
      user = user_fixture()
      assert Accounts.list_tbl_user() == [user]
    end

    test "get_user!/1 returns the user with given id" do
      user = user_fixture()
      assert Accounts.get_user!(user.id) == user
    end

    test "create_user/1 with valid data creates a user" do
      valid_attrs = %{auto_password: "some auto_password", creator_id: "some creator_id", email: "some email", gender: "some gender", name: "some name", password: "some password", phone: "some phone", status: "some status", user_role: "some user_role", user_type: 42, username: "some username"}

      assert {:ok, %User{} = user} = Accounts.create_user(valid_attrs)
      assert user.auto_password == "some auto_password"
      assert user.creator_id == "some creator_id"
      assert user.email == "some email"
      assert user.gender == "some gender"
      assert user.name == "some name"
      assert user.password == "some password"
      assert user.phone == "some phone"
      assert user.status == "some status"
      assert user.user_role == "some user_role"
      assert user.user_type == 42
      assert user.username == "some username"
    end

    test "create_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_user(@invalid_attrs)
    end

    test "update_user/2 with valid data updates the user" do
      user = user_fixture()
      update_attrs = %{auto_password: "some updated auto_password", creator_id: "some updated creator_id", email: "some updated email", gender: "some updated gender", name: "some updated name", password: "some updated password", phone: "some updated phone", status: "some updated status", user_role: "some updated user_role", user_type: 43, username: "some updated username"}

      assert {:ok, %User{} = user} = Accounts.update_user(user, update_attrs)
      assert user.auto_password == "some updated auto_password"
      assert user.creator_id == "some updated creator_id"
      assert user.email == "some updated email"
      assert user.gender == "some updated gender"
      assert user.name == "some updated name"
      assert user.password == "some updated password"
      assert user.phone == "some updated phone"
      assert user.status == "some updated status"
      assert user.user_role == "some updated user_role"
      assert user.user_type == 43
      assert user.username == "some updated username"
    end

    test "update_user/2 with invalid data returns error changeset" do
      user = user_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_user(user, @invalid_attrs)
      assert user == Accounts.get_user!(user.id)
    end

    test "delete_user/1 deletes the user" do
      user = user_fixture()
      assert {:ok, %User{}} = Accounts.delete_user(user)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_user!(user.id) end
    end

    test "change_user/1 returns a user changeset" do
      user = user_fixture()
      assert %Ecto.Changeset{} = Accounts.change_user(user)
    end
  end
end
