import fastq, { queueAsPromised } from 'fastq';

export const QueueServicePattern = (work: any): queueAsPromised<any> => fastq.promise(work, 2);