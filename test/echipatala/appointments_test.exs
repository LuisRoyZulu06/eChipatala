defmodule Echipatala.AppointmentsTest do
  use Echipatala.DataCase

  alias Echipatala.Appointments

  describe "tbl_appointment" do
    alias Echipatala.Appointments.Appointment

    import Echipatala.AppointmentsFixtures

    @invalid_attrs %{appoint_ref: nil, appointment_date: nil, client_id: nil, descript: nil, doct_id: nil, init_date: nil, initiator_id: nil, inst_id: nil, status: nil, status_note: nil}

    test "list_tbl_appointment/0 returns all tbl_appointment" do
      appointment = appointment_fixture()
      assert Appointments.list_tbl_appointment() == [appointment]
    end

    test "get_appointment!/1 returns the appointment with given id" do
      appointment = appointment_fixture()
      assert Appointments.get_appointment!(appointment.id) == appointment
    end

    test "create_appointment/1 with valid data creates a appointment" do
      valid_attrs = %{appoint_ref: "some appoint_ref", appointment_date: "some appointment_date", client_id: "some client_id", descript: "some descript", doct_id: "some doct_id", init_date: "some init_date", initiator_id: "some initiator_id", inst_id: "some inst_id", status: "some status", status_note: "some status_note"}

      assert {:ok, %Appointment{} = appointment} = Appointments.create_appointment(valid_attrs)
      assert appointment.appoint_ref == "some appoint_ref"
      assert appointment.appointment_date == "some appointment_date"
      assert appointment.client_id == "some client_id"
      assert appointment.descript == "some descript"
      assert appointment.doct_id == "some doct_id"
      assert appointment.init_date == "some init_date"
      assert appointment.initiator_id == "some initiator_id"
      assert appointment.inst_id == "some inst_id"
      assert appointment.status == "some status"
      assert appointment.status_note == "some status_note"
    end

    test "create_appointment/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Appointments.create_appointment(@invalid_attrs)
    end

    test "update_appointment/2 with valid data updates the appointment" do
      appointment = appointment_fixture()
      update_attrs = %{appoint_ref: "some updated appoint_ref", appointment_date: "some updated appointment_date", client_id: "some updated client_id", descript: "some updated descript", doct_id: "some updated doct_id", init_date: "some updated init_date", initiator_id: "some updated initiator_id", inst_id: "some updated inst_id", status: "some updated status", status_note: "some updated status_note"}

      assert {:ok, %Appointment{} = appointment} = Appointments.update_appointment(appointment, update_attrs)
      assert appointment.appoint_ref == "some updated appoint_ref"
      assert appointment.appointment_date == "some updated appointment_date"
      assert appointment.client_id == "some updated client_id"
      assert appointment.descript == "some updated descript"
      assert appointment.doct_id == "some updated doct_id"
      assert appointment.init_date == "some updated init_date"
      assert appointment.initiator_id == "some updated initiator_id"
      assert appointment.inst_id == "some updated inst_id"
      assert appointment.status == "some updated status"
      assert appointment.status_note == "some updated status_note"
    end

    test "update_appointment/2 with invalid data returns error changeset" do
      appointment = appointment_fixture()
      assert {:error, %Ecto.Changeset{}} = Appointments.update_appointment(appointment, @invalid_attrs)
      assert appointment == Appointments.get_appointment!(appointment.id)
    end

    test "delete_appointment/1 deletes the appointment" do
      appointment = appointment_fixture()
      assert {:ok, %Appointment{}} = Appointments.delete_appointment(appointment)
      assert_raise Ecto.NoResultsError, fn -> Appointments.get_appointment!(appointment.id) end
    end

    test "change_appointment/1 returns a appointment changeset" do
      appointment = appointment_fixture()
      assert %Ecto.Changeset{} = Appointments.change_appointment(appointment)
    end
  end
end
