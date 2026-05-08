// ============================================================
// screens/goals.js
// Goals screen: savings goals, progress tracking, contributions.
// ============================================================

import Components from '../components/components.js';
import Actions from '../state/actions.js';
import Utils from '../utils/utils.js';
import FormValidation from '../utils/formvalidation.js';

const GoalsScreen = (() => {

  function render(state) {
    const { goals } = state;

    const content = `
      <div class="screen-content">
        ${_renderHeader()}
        
        ${goals && goals.length > 0
          ? `
            <div class="goals-list px-lg mt-lg">
              ${goals.map((goal, idx) => _renderGoalCard(goal, idx)).join('')}
            </div>
          `
          : Components.EmptyState({
              icon: '🎯',
              title: 'No goals yet',
              text: 'Create a goal to start saving',
            })
        }

        <div class="px-lg mt-lg pb-2xl">
          ${Components.Button('Add Goal', {
            variant: 'primary',
            onClick: 'openAddGoal()',
            className: 'w-full',
          })}
        </div>
      </div>

      ${_renderAddGoalSheet()}
      ${_renderEditGoalSheet()}
      ${_renderContributeSheet()}
    `;

    setTimeout(() => {
      _initFormHandlers();
    }, 0);

    return content;
  }

  function _renderHeader() {
    return Components.Header('Goals', {
      subtitle: 'Track your savings targets',
    });
  }

  function _renderGoalCard(goal, idx) {
    const progress = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
    const displayProgress = Math.min(progress, 100);
    const remaining = Math.max(0, goal.target - goal.current);
    const deadline = new Date(goal.deadline);
    const deadlineStr = deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const isOverdue = deadline < new Date() && goal.current < goal.target;

    return `
      <div class="goal-card">
        <div class="goal-header">
          <h3 class="goal-title">${goal.name}</h3>
          <button class="btn btn-tertiary btn-small" onclick="editGoal(${idx})">
            ✏️ Edit
          </button>
        </div>

        ${isOverdue ? `
          <div class="alert alert-warning mt-md">
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
              <div class="alert-message">Goal deadline has passed</div>
            </div>
          </div>
        ` : ''}

        <div class="goal-progress mt-lg">
          <div class="progress-container">
            <div class="progress-bar" style="width: ${displayProgress}%; background-color: var(--accent-color);"></div>
          </div>
          <div class="flex justify-between items-baseline mt-md gap-lg">
            <div>
              <div class="text-caption text-secondary">Saved</div>
              <div class="text-body font-semibold">${Utils.formatCurrency(goal.current)}</div>
            </div>
            <div class="text-center">
              <div class="text-caption text-secondary">${displayProgress}%</div>
            </div>
            <div class="text-right">
              <div class="text-caption text-secondary">Target</div>
              <div class="text-body font-semibold">${Utils.formatCurrency(goal.target)}</div>
            </div>
          </div>
        </div>

        <div class="goal-details mt-lg">
          <div class="goal-detail-row">
            <span class="text-caption text-secondary">Remaining</span>
            <span class="text-caption font-semibold ${remaining > 0 ? 'text-primary' : 'text-success'}">${Utils.formatCurrency(remaining)}</span>
          </div>
          <div class="goal-detail-row">
            <span class="text-caption text-secondary">Deadline</span>
            <span class="text-caption font-semibold ${isOverdue ? 'text-danger' : 'text-primary'}">${deadlineStr}</span>
          </div>
        </div>

        <div class="flex gap-md mt-lg">
          ${Components.Button('Add Progress', {
            variant: 'secondary',
            onClick: `openContributeGoal(${idx})`,
            className: 'flex-1',
          })}
          ${Components.Button('Delete', {
            variant: 'danger',
            onClick: `deleteGoalConfirm(${idx})`,
            className: 'flex-1',
          })}
        </div>
      </div>
    `;
  }

  function _renderAddGoalSheet() {
    return `
      <div id="add-goal-overlay" class="sheet-overlay" onclick="closeAddGoal()">
        <div class="sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>
          
          <h2 class="text-title mb-lg">New Goal</h2>
          
          <form id="add-goal-form" onsubmit="submitAddGoal(event)">
            <div class="form-group">
              ${Components.FormGroup(
                Components.Input({
                  type: 'text',
                  name: 'goal-name',
                  placeholder: 'e.g., Vacation Fund',
                  required: true,
                  icon: '🎯',
                  iconPosition: 'left',
                }),
                {
                  label: 'Goal Name',
                }
              )}
            </div>

            <div class="form-group">
              ${Components.FormGroup(
                Components.Input({
                  type: 'number',
                  name: 'goal-target',
                  placeholder: '5000.00',
                  required: true,
                  icon: '$',
                  iconPosition: 'left',
                }),
                {
                  label: 'Target Amount',
                }
              )}
            </div>

            <div class="form-group">
              ${Components.FormGroup(
                Components.Input({
                  type: 'date',
                  name: 'goal-deadline',
                  required: true,
                }),
                {
                  label: 'Target Date',
                }
              )}
            </div>

            <div class="flex gap-md mt-2xl">
              ${Components.Button('Cancel', {
                variant: 'secondary',
                onClick: 'closeAddGoal()',
              })}
              ${Components.Button('Create', {
                variant: 'primary',
                onClick: '',
              })}
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function _renderEditGoalSheet() {
    return `
      <div id="edit-goal-overlay" class="sheet-overlay" onclick="closeEditGoal()">
        <div class="sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>
          
          <h2 class="text-title mb-lg">Edit Goal</h2>
          
          <form id="edit-goal-form" onsubmit="submitEditGoal(event)">
            <div class="form-group">
              ${Components.FormGroup(
                Components.Input({
                  type: 'text',
                  name: 'edit-goal-name',
                  placeholder: 'Goal name',
                  required: true,
                  icon: '🎯',
                  iconPosition: 'left',
                }),
                {
                  label: 'Goal Name',
                }
              )}
            </div>

            <div class="form-group">
              ${Components.FormGroup(
                Components.Input({
                  type: 'number',
                  name: 'edit-goal-target',
                  placeholder: 'Target amount',
                  required: true,
                  icon: '$',
                  iconPosition: 'left',
                }),
                {
                  label: 'Target Amount',
                }
              )}
            </div>

            <div class="form-group">
              ${Components.FormGroup(
                Components.Input({
                  type: 'date',
                  name: 'edit-goal-deadline',
                  required: true,
                }),
                {
                  label: 'Target Date',
                }
              )}
            </div>

            <div class="flex gap-md mt-2xl">
              ${Components.Button('Cancel', {
                variant: 'secondary',
                onClick: 'closeEditGoal()',
              })}
              ${Components.Button('Save', {
                variant: 'primary',
                onClick: '',
              })}
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function _initFormHandlers() {
    FormValidation.setupAutoClear('add-goal-form');
    FormValidation.setupAutoClear('edit-goal-form');
    FormValidation.setupAutoClear('contribute-goal-form');
  }

  return { render };

})();

export default GoalsScreen;

  function _renderContributeSheet() {
    return \`
      <div id="contribute-goal-overlay" class="sheet-overlay" onclick="closeContributeGoal()">
        <div class="sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>
          
          <h2 class="text-title mb-lg">Add to Goal</h2>
          
          <form id="contribute-goal-form" onsubmit="submitContributeGoal(event)">
            <div class="form-group">
              \${Components.FormGroup(
                Components.Input({
                  type: 'number',
                  name: 'contribute-amount',
                  placeholder: '0.00',
                  required: true,
                  icon: '$',
                  iconPosition: 'left',
                }),
                {
                  label: 'Contribution Amount',
                  help: 'How much to add to this goal',
                }
              )}
            </div>

            <div class="flex gap-md mt-2xl">
              \${Components.Button('Cancel', {
                variant: 'secondary',
                onClick: 'closeContributeGoal()',
              })}
              \${Components.Button('Add', {
                variant: 'primary',
                onClick: '',
              })}
            </div>
          </form>
        </div>
      </div>
    \`;
  }
