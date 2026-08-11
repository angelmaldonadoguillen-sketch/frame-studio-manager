const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

const todayInTegucigalpa = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Tegucigalpa', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

// Se ejecuta en servidor: no depende de que alguien abra Frame ni del
// localStorage de un dispositivo. Respeta la configuración de cada tablero.
exports.carryOverIncompleteTasks = onSchedule({
  schedule: '5 0 * * *',
  timeZone: 'America/Tegucigalpa',
  region: 'us-central1',
}, async () => {
  const today = todayInTegucigalpa();
  const workspaces = await db.collection('frame_workspaces').get();
  const batches = [];

  for (const workspace of workspaces.docs) {
    const settings = await workspace.ref.collection('config').doc('display_settings').get();
    if (!settings.data()?.carryOverProjects) continue;

    const tasks = await db.collection('frame_projects')
      .where('workspaceId', '==', workspace.id).get();
    let batch = db.batch();
    let count = 0;

    for (const task of tasks.docs) {
      const data = task.data();
      const checklist = Array.isArray(data.checklist) ? data.checklist : [];
      const incomplete = checklist.length > 0 && checklist.some(item => !item.done);
      const refDate = data.sessionDate || data.deadline;
      if (!incomplete || !refDate || refDate >= today || ['delivered', 'archived'].includes(data.status)) continue;

      batch.update(task.ref, {
        sessionDate: today,
        carryOverAt: FieldValue.serverTimestamp(),
      });
      const activity = task.ref.collection('activity').doc();
      batch.set(activity, {
        id: activity.id,
        actorId: 'system',
        actorName: 'Frame',
        summary: 'movió la próxima fecha de trabajo por checklist incompleto',
        at: new Date().toISOString(),
      });
      count += 1;
      if (count === 400) { batches.push(batch.commit()); batch = db.batch(); count = 0; }
    }
    if (count > 0) batches.push(batch.commit());
  }
  await Promise.all(batches);
});
