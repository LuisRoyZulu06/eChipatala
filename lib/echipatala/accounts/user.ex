defmodule Echipatala.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tbl_user" do
    field :auto_password, :string
    field :creator_id, :string
    field :email, :string
    field :gender, :string
    field :name, :string
    field :password, :string
    field :phone, :string
    field :status, :string
    field :user_role, :string
    field :user_type, :integer
    field :username, :string
    field :institution_id, :id

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :username, :email, :phone, :gender, :user_type, :user_role, :status, :password, :auto_password, :creator_id, :institution_id])
    |> validate_required([:name, :username, :email, :phone, :gender, :user_type, :user_role, :status, :password, :auto_password])
    |> validate_length(:password, min: 8, message: " should be atleast 8 characters long")
    |> validate_length(:name, min: 2, message: "should be between 3 characters long")
    |> validate_length(:email, min: 5, message: "Email Length should be between 5 characters long")
    |> unique_constraint(:email, username: :unique_email, message: " Email address already exists")
    |> validate_user_role()
    |> put_pass_hash
  end

  defp validate_user_role(%Ecto.Changeset{valid?: true, changes: %{user_type: type, user_role: role}} = changeset) do
    case role == 1 && type == 2 do
      true ->
        add_error(changeset, :user, "under operations can't be admin")
      _->
        changeset
    end
  end

  defp validate_user_role(changeset), do: changeset

  defp put_pass_hash(%Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset) do
    Ecto.Changeset.put_change(changeset, :password, encrypt_password(password))
  end

  defp put_pass_hash(changeset), do: changeset

  @spec encrypt_password(binary | maybe_improper_list(binary | maybe_improper_list(any, binary | []) | byte, binary | [])) :: binary
  def encrypt_password(password), do: Base.encode16(:crypto.hash(:sha512, password))
end

#Echipatala.Accounts.create_user(%{name: "Luis Roy", username: "Luis", email: "luis@probasegroup.com", password: "password06", user_type: 1, user_role: "ADMIN", status: "1", phone: "260979797337", gender: "M", auto_password: "N",  inserted_at: NaiveDateTime.utc_now, updated_at: NaiveDateTime.utc_now})
#Echipatala.Accounts.create_user(%{name: "Myself", username: "me", email: "lunje@probasegroup.com", password: "password06", user_type: 1, user_role: "ADMIN", status: "1", phone: "260979797337", gender: "M", auto_password: "N",  inserted_at: NaiveDateTime.utc_now, updated_at: NaiveDateTime.utc_now})
