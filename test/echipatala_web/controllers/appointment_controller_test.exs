defmodule EchipatalaWeb.AppointmentControllerTest do
  use EchipatalaWeb.ConnCase

  import Echipatala.AppointmentsFixtures

  @create_attrs %{appoint_ref: "some appoint_ref", appointment_date: "some appointment_date", client_id: "some client_id", descript: "some descript", doct_id: "some doct_id", init_date: "some init_date", initiator_id: "some initiator_id", inst_id: "some inst_id", status: "some status", status_note: "some status_note"}
  @update_attrs %{appoint_ref: "some updated appoint_ref", appointment_date: "some updated appointment_date", client_id: "some updated client_id", descript: "some updated descript", doct_id: "some updated doct_id", init_date: "some updated init_date", initiator_id: "some updated initiator_id", inst_id: "some updated inst_id", status: "some updated status", status_note: "some updated status_note"}
  @invalid_attrs %{appoint_ref: nil, appointment_date: nil, client_id: nil, descript: nil, doct_id: nil, init_date: nil, initiator_id: nil, inst_id: nil, status: nil, status_note: nil}

  describe "index" do
    test "lists all tbl_appointment", %{conn: conn} do
      conn = get(conn, Routes.appointment_path(conn, :index))
      assert html_response(conn, 200) =~ "Listing Tbl appointment"
    end
  end

  describe "new appointment" do
    test "renders form", %{conn: conn} do
      conn = get(conn, Routes.appointment_path(conn, :new))
      assert html_response(conn, 200) =~ "New Appointment"
    end
  end

  describe "create appointment" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, Routes.appointment_path(conn, :create), appointment: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == Routes.appointment_path(conn, :show, id)

      conn = get(conn, Routes.appointment_path(conn, :show, id))
      assert html_response(conn, 200) =~ "Show Appointment"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.appointment_path(conn, :create), appointment: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Appointment"
    end
  end

  describe "edit appointment" do
    setup [:create_appointment]

    test "renders form for editing chosen appointment", %{conn: conn, appointment: appointment} do
      conn = get(conn, Routes.appointment_path(conn, :edit, appointment))
      assert html_response(conn, 200) =~ "Edit Appointment"
    end
  end

  describe "update appointment" do
    setup [:create_appointment]

    test "redirects when data is valid", %{conn: conn, appointment: appointment} do
      conn = put(conn, Routes.appointment_path(conn, :update, appointment), appointment: @update_attrs)
      assert redirected_to(conn) == Routes.appointment_path(conn, :show, appointment)

      conn = get(conn, Routes.appointment_path(conn, :show, appointment))
      assert html_response(conn, 200) =~ "some updated appoint_ref"
    end

    test "renders errors when data is invalid", %{conn: conn, appointment: appointment} do
      conn = put(conn, Routes.appointment_path(conn, :update, appointment), appointment: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Appointment"
    end
  end

  describe "delete appointment" do
    setup [:create_appointment]

    test "deletes chosen appointment", %{conn: conn, appointment: appointment} do
      conn = delete(conn, Routes.appointment_path(conn, :delete, appointment))
      assert redirected_to(conn) == Routes.appointment_path(conn, :index)

      assert_error_sent 404, fn ->
        get(conn, Routes.appointment_path(conn, :show, appointment))
      end
    end
  end

  defp create_appointment(_) do
    appointment = appointment_fixture()
    %{appointment: appointment}
  end
end
