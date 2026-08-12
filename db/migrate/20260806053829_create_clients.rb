class CreateClients < ActiveRecord::Migration[8.1]
  def change
    create_table :clients do |t|
      t.string :name
      t.decimal :price
      t.text :description

      t.timestamps
    end
  end
end
