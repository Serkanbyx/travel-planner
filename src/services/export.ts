import { TravelPlan } from '@/types';
import { format } from 'date-fns';
import { formatTime } from '@/lib/utils';

/**
 * Exports a travel plan as JSON
 * @param plan - The travel plan to export
 */
export function exportAsJson(plan: TravelPlan): void {
  const blob = new Blob([JSON.stringify(plan, null, 2)], {
    type: 'application/json',
  });
  downloadBlob(blob, `${plan.city}-travel-plan.json`);
}

/**
 * Exports a travel plan as formatted text
 * @param plan - The travel plan to export
 */
export function exportAsText(plan: TravelPlan): void {
  let text = `
===========================================
          TRAVEL PLAN: ${plan.city.toUpperCase()}, ${plan.country.toUpperCase()}
===========================================

Dates: ${format(new Date(plan.startDate), 'MMM d, yyyy')} - ${format(new Date(plan.endDate), 'MMM d, yyyy')}

${plan.description ? `Description: ${plan.description}\n` : ''}
${plan.wikiSummary ? `About ${plan.city}: ${plan.wikiSummary}\n` : ''}
-------------------------------------------

DAILY ITINERARY
===============
`;

  plan.days.forEach((day, index) => {
    text += `
Day ${index + 1} - ${format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
${'-'.repeat(40)}
`;

    if (day.activities.length === 0) {
      text += '  No activities planned\n';
    } else {
      day.activities.forEach((activity) => {
        text += `
  ${formatTime(activity.time)} - ${activity.title}
  Category: ${activity.category}
  ${activity.location ? `Location: ${activity.location}` : ''}
  ${activity.duration ? `Duration: ${activity.duration} minutes` : ''}
  ${activity.description ? `Description: ${activity.description}` : ''}
  ${activity.notes ? `Notes: ${activity.notes}` : ''}
`;
      });
    }
  });

  text += `
-------------------------------------------
Generated on: ${format(new Date(), 'PPpp')}
Travel Planner App
`;

  const blob = new Blob([text], { type: 'text/plain' });
  downloadBlob(blob, `${plan.city}-travel-plan.txt`);
}

/**
 * Exports a travel plan as HTML (can be printed as PDF)
 * @param plan - The travel plan to export
 */
export function exportAsHtml(plan: TravelPlan): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${plan.city} Travel Plan</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    .header h1 { font-size: 2.5rem; color: #1f2937; }
    .header p { color: #6b7280; margin-top: 8px; }
    .meta { 
      display: flex; 
      justify-content: center; 
      gap: 20px; 
      margin-top: 16px;
      flex-wrap: wrap;
    }
    .meta span {
      background: #f3f4f6;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.875rem;
    }
    .description {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .day {
      margin-bottom: 30px;
      break-inside: avoid;
    }
    .day-header {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      padding: 12px 20px;
      border-radius: 8px 8px 0 0;
      font-weight: 600;
    }
    .day-content {
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
      padding: 20px;
    }
    .activity {
      display: flex;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .activity:last-child { border-bottom: none; }
    .activity-time {
      font-weight: 600;
      color: #3b82f6;
      white-space: nowrap;
      min-width: 80px;
    }
    .activity-details h4 { font-size: 1rem; margin-bottom: 4px; }
    .activity-details p { font-size: 0.875rem; color: #6b7280; }
    .category {
      display: inline-block;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 12px;
      margin-top: 8px;
    }
    .category-sightseeing { background: #dbeafe; color: #1e40af; }
    .category-food { background: #ffedd5; color: #c2410c; }
    .category-transport { background: #dcfce7; color: #166534; }
    .category-accommodation { background: #f3e8ff; color: #7e22ce; }
    .category-shopping { background: #fce7f3; color: #be185d; }
    .category-entertainment { background: #fef3c7; color: #b45309; }
    .category-other { background: #f3f4f6; color: #374151; }
    .empty-day { color: #9ca3af; font-style: italic; }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #9ca3af;
      font-size: 0.875rem;
    }
    @media print {
      body { padding: 20px; }
      .day { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${plan.city}, ${plan.country}</h1>
    <p>Travel Itinerary</p>
    <div class="meta">
      <span>${format(new Date(plan.startDate), 'MMM d')} - ${format(new Date(plan.endDate), 'MMM d, yyyy')}</span>
      <span>${plan.days.length} Days</span>
      <span>${plan.days.reduce((sum, day) => sum + day.activities.length, 0)} Activities</span>
    </div>
  </div>
  
  ${plan.description || plan.wikiSummary ? `
  <div class="description">
    ${plan.description ? `<p><strong>Trip Description:</strong> ${plan.description}</p>` : ''}
    ${plan.wikiSummary ? `<p style="margin-top: 12px;"><strong>About ${plan.city}:</strong> ${plan.wikiSummary}</p>` : ''}
  </div>
  ` : ''}
  
  ${plan.days.map((day, index) => `
  <div class="day">
    <div class="day-header">
      Day ${index + 1} - ${format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
    </div>
    <div class="day-content">
      ${day.activities.length === 0 
        ? '<p class="empty-day">No activities planned for this day</p>'
        : day.activities.map(activity => `
          <div class="activity">
            <div class="activity-time">${formatTime(activity.time)}</div>
            <div class="activity-details">
              <h4>${activity.title}</h4>
              ${activity.location ? `<p>📍 ${activity.location}</p>` : ''}
              ${activity.description ? `<p>${activity.description}</p>` : ''}
              ${activity.notes ? `<p><em>Notes: ${activity.notes}</em></p>` : ''}
              <span class="category category-${activity.category}">${activity.category}</span>
            </div>
          </div>
        `).join('')
      }
    </div>
  </div>
  `).join('')}
  
  <div class="footer">
    <p>Generated on ${format(new Date(), 'PPpp')}</p>
    <p>Travel Planner App</p>
  </div>
</body>
</html>
`;

  const blob = new Blob([html], { type: 'text/html' });
  downloadBlob(blob, `${plan.city}-travel-plan.html`);
}

/**
 * Helper function to download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
