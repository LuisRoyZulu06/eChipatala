defmodule Echipatala.ChatTest do
  use Echipatala.DataCase

  alias Echipatala.Chat

  describe "tbl_chat" do
    alias Echipatala.Chat.ChatDetails

    import Echipatala.ChatFixtures

    @invalid_attrs %{client_id: nil, msg: nil, staff_id: nil}

    test "list_tbl_chat/0 returns all tbl_chat" do
      chat_details = chat_details_fixture()
      assert Chat.list_tbl_chat() == [chat_details]
    end

    test "get_chat_details!/1 returns the chat_details with given id" do
      chat_details = chat_details_fixture()
      assert Chat.get_chat_details!(chat_details.id) == chat_details
    end

    test "create_chat_details/1 with valid data creates a chat_details" do
      valid_attrs = %{client_id: "some client_id", msg: "some msg", staff_id: "some staff_id"}

      assert {:ok, %ChatDetails{} = chat_details} = Chat.create_chat_details(valid_attrs)
      assert chat_details.client_id == "some client_id"
      assert chat_details.msg == "some msg"
      assert chat_details.staff_id == "some staff_id"
    end

    test "create_chat_details/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Chat.create_chat_details(@invalid_attrs)
    end

    test "update_chat_details/2 with valid data updates the chat_details" do
      chat_details = chat_details_fixture()
      update_attrs = %{client_id: "some updated client_id", msg: "some updated msg", staff_id: "some updated staff_id"}

      assert {:ok, %ChatDetails{} = chat_details} = Chat.update_chat_details(chat_details, update_attrs)
      assert chat_details.client_id == "some updated client_id"
      assert chat_details.msg == "some updated msg"
      assert chat_details.staff_id == "some updated staff_id"
    end

    test "update_chat_details/2 with invalid data returns error changeset" do
      chat_details = chat_details_fixture()
      assert {:error, %Ecto.Changeset{}} = Chat.update_chat_details(chat_details, @invalid_attrs)
      assert chat_details == Chat.get_chat_details!(chat_details.id)
    end

    test "delete_chat_details/1 deletes the chat_details" do
      chat_details = chat_details_fixture()
      assert {:ok, %ChatDetails{}} = Chat.delete_chat_details(chat_details)
      assert_raise Ecto.NoResultsError, fn -> Chat.get_chat_details!(chat_details.id) end
    end

    test "change_chat_details/1 returns a chat_details changeset" do
      chat_details = chat_details_fixture()
      assert %Ecto.Changeset{} = Chat.change_chat_details(chat_details)
    end
  end
end
