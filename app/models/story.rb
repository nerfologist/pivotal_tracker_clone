# == Schema Information
#
# Table name: stories
#
#  id         :integer          not null, primary key
#  tab_id     :integer
#  title      :string(255)      not null
#  type       :string(255)
#  points     :integer
#  state      :string(255)      not null
#  created_at :datetime
#  updated_at :datetime
#

class Story < ActiveRecord::Base
  validates :tab, :title, presence: true
  validates :type, inclusion: { in: %w(feature bug chore release), allow_nil: true }
  validates :points,
              numericality:
                { only_integer: true,
                  greater_than_or_equal_to: 1,
                  less_than_or_equal_to: 4,
                  allow_nil: true }
  validates :state, inclusion: { in: %w(unstarted started finished accepted rejected) }
  
  after_initialize :ensure_valid_state
  
  belongs_to :tab
  has_one :project, through: :tab, source: :project
  
  def ensure_valid_state
    self.state ||= 'unstarted'
  end
end