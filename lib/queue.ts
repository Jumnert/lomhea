import { redis } from "./redis";

/**
 * Producer: Enqueue a job into a Redis Stream.
 */
export async function enqueueJob(queueName: string, data: any) {
  const message = {
    data: JSON.stringify(data),
    timestamp: Date.now().toString(),
  };

  await redis.xadd(`queue:${queueName}`, "*", message);
  console.log(`[Queue] Enqueued job to ${queueName}`);
}

/**
 * Consumer logic (Example usage in a cron job or background worker).
 * In serverless, this could be triggered by QStash or a scheduled function.
 */
export async function processQueue(
  queueName: string,
  processor: (data: any) => Promise<void>,
) {
  const streamKey = `queue:${queueName}`;
  const groupName = `${queueName}-group`;
  const consumerName = `consumer-1`;

  try {
    // Create consumer group if not exists
    // @ts-ignore
    await redis.xgroup("CREATE", streamKey, groupName, "0", { MKSTREAM: true });
  } catch (e: any) {
    // Group already exists, ignore
  }

  // Read pending messages
  // @ts-ignore - Upstash Redis xreadgroup types can be tricky
  const messages = await redis.xreadgroup(
    "GROUP",
    groupName,
    consumerName,
    [streamKey],
    [">"],
    { count: 1, block: 1000 },
  );

  if (messages && (messages as any).length > 0) {
    for (const [stream, streamMessages] of messages as any) {
      for (const [id, fields] of streamMessages as any) {
        try {
          // Fields in Upstash are [key, value, key, value...]
          const dataIndex = fields.indexOf("data");
          if (dataIndex === -1) continue;
          const data = JSON.parse(fields[dataIndex + 1]);
          await processor(data);
          // Acknowledge message
          await redis.xack(streamKey, groupName, id);
        } catch (error) {
          console.error(`[Queue] Error processing job ${id}:`, error);
        }
      }
    }
  }
}
