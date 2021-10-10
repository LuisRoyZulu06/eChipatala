defmodule EchipatalaWeb.SymptomControllerTest do
  use EchipatalaWeb.ConnCase

  import Echipatala.DiseasesFixtures

  @create_attrs %{category: "some category", maker_id: "some maker_id", name: "some name"}
  @update_attrs %{category: "some updated category", maker_id: "some updated maker_id", name: "some updated name"}
  @invalid_attrs %{category: nil, maker_id: nil, name: nil}

  describe "index" do
    test "lists all tbl_symptom", %{conn: conn} do
      conn = get(conn, Routes.symptom_path(conn, :index))
      assert html_response(conn, 200) =~ "Listing Tbl symptom"
    end
  end

  describe "new symptom" do
    test "renders form", %{conn: conn} do
      conn = get(conn, Routes.symptom_path(conn, :new))
      assert html_response(conn, 200) =~ "New Symptom"
    end
  end

  describe "create symptom" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, Routes.symptom_path(conn, :create), symptom: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == Routes.symptom_path(conn, :show, id)

      conn = get(conn, Routes.symptom_path(conn, :show, id))
      assert html_response(conn, 200) =~ "Show Symptom"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.symptom_path(conn, :create), symptom: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Symptom"
    end
  end

  describe "edit symptom" do
    setup [:create_symptom]

    test "renders form for editing chosen symptom", %{conn: conn, symptom: symptom} do
      conn = get(conn, Routes.symptom_path(conn, :edit, symptom))
      assert html_response(conn, 200) =~ "Edit Symptom"
    end
  end

  describe "update symptom" do
    setup [:create_symptom]

    test "redirects when data is valid", %{conn: conn, symptom: symptom} do
      conn = put(conn, Routes.symptom_path(conn, :update, symptom), symptom: @update_attrs)
      assert redirected_to(conn) == Routes.symptom_path(conn, :show, symptom)

      conn = get(conn, Routes.symptom_path(conn, :show, symptom))
      assert html_response(conn, 200) =~ "some updated category"
    end

    test "renders errors when data is invalid", %{conn: conn, symptom: symptom} do
      conn = put(conn, Routes.symptom_path(conn, :update, symptom), symptom: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Symptom"
    end
  end

  describe "delete symptom" do
    setup [:create_symptom]

    test "deletes chosen symptom", %{conn: conn, symptom: symptom} do
      conn = delete(conn, Routes.symptom_path(conn, :delete, symptom))
      assert redirected_to(conn) == Routes.symptom_path(conn, :index)

      assert_error_sent 404, fn ->
        get(conn, Routes.symptom_path(conn, :show, symptom))
      end
    end
  end

  defp create_symptom(_) do
    symptom = symptom_fixture()
    %{symptom: symptom}
  end
end
