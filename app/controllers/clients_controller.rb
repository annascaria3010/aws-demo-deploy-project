class ClientsController < ApplicationController
  before_action :require_login

  def index
    names = Client.order(created_at: :desc).select(:id, :name, :created_at)
    render json: names
  end

  def create
    client = Client.new(name: params[:name] || params.dig(:client, :name))

    if client.save
      render json: { success: true, client: client.slice(:id, :name, :created_at) }, status: :created
    else
      render json: { success: false, errors: client.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    client = Client.find_by(id: params[:id])

    if client&.destroy
      render json: { success: true, id: client.id }
    else
      render json: { success: false, error: "Unable to delete name." }, status: :unprocessable_entity
    end
  end
end
