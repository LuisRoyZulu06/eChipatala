defmodule Echipatala.InstitutionsTest do
  use Echipatala.DataCase

  alias Echipatala.Institutions

  describe "tbl_institutions" do
    alias Echipatala.Institutions.InstitutionDetails

    import Echipatala.InstitutionsFixtures

    @invalid_attrs %{address: nil, creator_id: nil, email: nil, institution_type: nil, name: nil, system_user_id: nil, tel: nil}

    test "list_tbl_institutions/0 returns all tbl_institutions" do
      institution_details = institution_details_fixture()
      assert Institutions.list_tbl_institutions() == [institution_details]
    end

    test "get_institution_details!/1 returns the institution_details with given id" do
      institution_details = institution_details_fixture()
      assert Institutions.get_institution_details!(institution_details.id) == institution_details
    end

    test "create_institution_details/1 with valid data creates a institution_details" do
      valid_attrs = %{address: "some address", creator_id: "some creator_id", email: "some email", institution_type: "some institution_type", name: "some name", system_user_id: "some system_user_id", tel: "some tel"}

      assert {:ok, %InstitutionDetails{} = institution_details} = Institutions.create_institution_details(valid_attrs)
      assert institution_details.address == "some address"
      assert institution_details.creator_id == "some creator_id"
      assert institution_details.email == "some email"
      assert institution_details.institution_type == "some institution_type"
      assert institution_details.name == "some name"
      assert institution_details.system_user_id == "some system_user_id"
      assert institution_details.tel == "some tel"
    end

    test "create_institution_details/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Institutions.create_institution_details(@invalid_attrs)
    end

    test "update_institution_details/2 with valid data updates the institution_details" do
      institution_details = institution_details_fixture()
      update_attrs = %{address: "some updated address", creator_id: "some updated creator_id", email: "some updated email", institution_type: "some updated institution_type", name: "some updated name", system_user_id: "some updated system_user_id", tel: "some updated tel"}

      assert {:ok, %InstitutionDetails{} = institution_details} = Institutions.update_institution_details(institution_details, update_attrs)
      assert institution_details.address == "some updated address"
      assert institution_details.creator_id == "some updated creator_id"
      assert institution_details.email == "some updated email"
      assert institution_details.institution_type == "some updated institution_type"
      assert institution_details.name == "some updated name"
      assert institution_details.system_user_id == "some updated system_user_id"
      assert institution_details.tel == "some updated tel"
    end

    test "update_institution_details/2 with invalid data returns error changeset" do
      institution_details = institution_details_fixture()
      assert {:error, %Ecto.Changeset{}} = Institutions.update_institution_details(institution_details, @invalid_attrs)
      assert institution_details == Institutions.get_institution_details!(institution_details.id)
    end

    test "delete_institution_details/1 deletes the institution_details" do
      institution_details = institution_details_fixture()
      assert {:ok, %InstitutionDetails{}} = Institutions.delete_institution_details(institution_details)
      assert_raise Ecto.NoResultsError, fn -> Institutions.get_institution_details!(institution_details.id) end
    end

    test "change_institution_details/1 returns a institution_details changeset" do
      institution_details = institution_details_fixture()
      assert %Ecto.Changeset{} = Institutions.change_institution_details(institution_details)
    end
  end
end
