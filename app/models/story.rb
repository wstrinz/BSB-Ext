class Story < ActiveRecord::Base
  attr_accessible :author, :content, :published, :summary, :title, :url, :source
  belongs_to :feed
end
