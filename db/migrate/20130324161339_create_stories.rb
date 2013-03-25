class CreateStories < ActiveRecord::Migration
  def change
    create_table :stories do |t|
      t.string :title
      t.string :author
      t.string :url
      t.string :summary
      t.string :content
      t.string :published

      t.timestamps
    end
  end
end
