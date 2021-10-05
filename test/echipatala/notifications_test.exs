defmodule Echipatala.NotificationsTest do
  use Echipatala.DataCase

  alias Echipatala.Notifications

  describe "tbl_email" do
    alias Echipatala.Notifications.Email

    import Echipatala.NotificationsFixtures

    @invalid_attrs %{attempts: nil, email_body: nil, receipient_email_address: nil, sender_email_address: nil, sender_name: nil, status: nil, subject: nil}

    test "list_tbl_email/0 returns all tbl_email" do
      email = email_fixture()
      assert Notifications.list_tbl_email() == [email]
    end

    test "get_email!/1 returns the email with given id" do
      email = email_fixture()
      assert Notifications.get_email!(email.id) == email
    end

    test "create_email/1 with valid data creates a email" do
      valid_attrs = %{attempts: "some attempts", email_body: "some email_body", receipient_email_address: "some receipient_email_address", sender_email_address: "some sender_email_address", sender_name: "some sender_name", status: "some status", subject: "some subject"}

      assert {:ok, %Email{} = email} = Notifications.create_email(valid_attrs)
      assert email.attempts == "some attempts"
      assert email.email_body == "some email_body"
      assert email.receipient_email_address == "some receipient_email_address"
      assert email.sender_email_address == "some sender_email_address"
      assert email.sender_name == "some sender_name"
      assert email.status == "some status"
      assert email.subject == "some subject"
    end

    test "create_email/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Notifications.create_email(@invalid_attrs)
    end

    test "update_email/2 with valid data updates the email" do
      email = email_fixture()
      update_attrs = %{attempts: "some updated attempts", email_body: "some updated email_body", receipient_email_address: "some updated receipient_email_address", sender_email_address: "some updated sender_email_address", sender_name: "some updated sender_name", status: "some updated status", subject: "some updated subject"}

      assert {:ok, %Email{} = email} = Notifications.update_email(email, update_attrs)
      assert email.attempts == "some updated attempts"
      assert email.email_body == "some updated email_body"
      assert email.receipient_email_address == "some updated receipient_email_address"
      assert email.sender_email_address == "some updated sender_email_address"
      assert email.sender_name == "some updated sender_name"
      assert email.status == "some updated status"
      assert email.subject == "some updated subject"
    end

    test "update_email/2 with invalid data returns error changeset" do
      email = email_fixture()
      assert {:error, %Ecto.Changeset{}} = Notifications.update_email(email, @invalid_attrs)
      assert email == Notifications.get_email!(email.id)
    end

    test "delete_email/1 deletes the email" do
      email = email_fixture()
      assert {:ok, %Email{}} = Notifications.delete_email(email)
      assert_raise Ecto.NoResultsError, fn -> Notifications.get_email!(email.id) end
    end

    test "change_email/1 returns a email changeset" do
      email = email_fixture()
      assert %Ecto.Changeset{} = Notifications.change_email(email)
    end
  end

  describe "tbl_sms" do
    alias Echipatala.Notifications.Sms

    import Echipatala.NotificationsFixtures

    @invalid_attrs %{date_sent: nil, mobile: nil, msg_count: nil, sms: nil, status: nil, type: nil}

    test "list_tbl_sms/0 returns all tbl_sms" do
      sms = sms_fixture()
      assert Notifications.list_tbl_sms() == [sms]
    end

    test "get_sms!/1 returns the sms with given id" do
      sms = sms_fixture()
      assert Notifications.get_sms!(sms.id) == sms
    end

    test "create_sms/1 with valid data creates a sms" do
      valid_attrs = %{date_sent: "some date_sent", mobile: "some mobile", msg_count: "some msg_count", sms: "some sms", status: "some status", type: "some type"}

      assert {:ok, %Sms{} = sms} = Notifications.create_sms(valid_attrs)
      assert sms.date_sent == "some date_sent"
      assert sms.mobile == "some mobile"
      assert sms.msg_count == "some msg_count"
      assert sms.sms == "some sms"
      assert sms.status == "some status"
      assert sms.type == "some type"
    end

    test "create_sms/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Notifications.create_sms(@invalid_attrs)
    end

    test "update_sms/2 with valid data updates the sms" do
      sms = sms_fixture()
      update_attrs = %{date_sent: "some updated date_sent", mobile: "some updated mobile", msg_count: "some updated msg_count", sms: "some updated sms", status: "some updated status", type: "some updated type"}

      assert {:ok, %Sms{} = sms} = Notifications.update_sms(sms, update_attrs)
      assert sms.date_sent == "some updated date_sent"
      assert sms.mobile == "some updated mobile"
      assert sms.msg_count == "some updated msg_count"
      assert sms.sms == "some updated sms"
      assert sms.status == "some updated status"
      assert sms.type == "some updated type"
    end

    test "update_sms/2 with invalid data returns error changeset" do
      sms = sms_fixture()
      assert {:error, %Ecto.Changeset{}} = Notifications.update_sms(sms, @invalid_attrs)
      assert sms == Notifications.get_sms!(sms.id)
    end

    test "delete_sms/1 deletes the sms" do
      sms = sms_fixture()
      assert {:ok, %Sms{}} = Notifications.delete_sms(sms)
      assert_raise Ecto.NoResultsError, fn -> Notifications.get_sms!(sms.id) end
    end

    test "change_sms/1 returns a sms changeset" do
      sms = sms_fixture()
      assert %Ecto.Changeset{} = Notifications.change_sms(sms)
    end
  end
end
