import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faHdd, faMemory, faMicrochip, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import Spinner from '@/components/elements/Spinner';
import isEqual from 'react-fast-compare';
import styled from 'styled-components/macro';

// Determines if the current value is in an alarm threshold so we can show it in red rather
// than the more faded default style.
const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const getUsagePercent = (current: number, limitMb: number): number => {
    if (limitMb === 0) return 0;
    return Math.min(100, (current / (limitMb * 1024 * 1024)) * 100);
};

interface StatusColors {
    bg: string;
    dot: string;
    label: string;
}

const getStatusColors = (status: ServerPowerState | undefined): StatusColors => {
    if (!status || status === 'offline') return { bg: 'rgba(239,68,68,0.12)', dot: '#ef4444', label: 'Offline' };
    if (status === 'running') return { bg: 'rgba(34,197,94,0.12)', dot: '#22c55e', label: 'Online' };
    return { bg: 'rgba(234,179,8,0.12)', dot: '#eab308', label: 'Starting' };
};

const CardWrapper = styled(Link)<{ $status: ServerPowerState | undefined }>`
    display: block;
    background: hsl(226, 28%, 17%);
    border: 1px solid hsl(228, 25%, 24%);
    border-radius: 0.875rem;
    padding: 1.25rem;
    text-decoration: none;
    color: inherit;
    transition: all 200ms ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: ${({ $status }) => {
            if (!$status || $status === 'offline') return 'linear-gradient(90deg, #ef4444, #dc2626)';
            if ($status === 'running') return 'linear-gradient(90deg, #22c55e, #16a34a)';
            return 'linear-gradient(90deg, #eab308, #ca8a04)';
        }};
        opacity: 0.8;
    }

    &:hover {
        border-color: hsl(228, 30%, 32%);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.2);
        transform: translateY(-2px);
    }
`;

const ResourceBar = styled.div<{ $percent: number; $alarm: boolean }>`
    height: 3px;
    border-radius: 2px;
    background: hsl(228, 25%, 24%);
    margin-top: 0.25rem;
    overflow: hidden;

    &::after {
        content: '';
        display: block;
        height: 100%;
        width: ${({ $percent }) => `${$percent}%`};
        border-radius: 2px;
        background: ${({ $alarm }) =>
            $alarm
                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                : 'linear-gradient(90deg, hsl(240, 60%, 60%), hsl(270, 60%, 60%))'};
        transition: width 500ms ease;
    }
`;

type Timer = ReturnType<typeof setInterval>;

const ServerRow = memo(({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended]);

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
    }

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
    const cpuLimit = server.limits.cpu !== 0 ? server.limits.cpu + ' %' : 'Unlimited';

    const statusColors = getStatusColors(stats?.status);
    const cpuPercent = stats ? (server.limits.cpu === 0 ? 0 : Math.min(100, (stats.cpuUsagePercent / server.limits.cpu) * 100)) : 0;
    const memPercent = stats ? getUsagePercent(stats.memoryUsageInBytes, server.limits.memory) : 0;
    const diskPercent = stats ? getUsagePercent(stats.diskUsageInBytes, server.limits.disk) : 0;

    const statusLabel = stats?.status
        ? statusColors.label
        : isSuspended
        ? 'Suspended'
        : server.isTransferring
        ? 'Transferring'
        : server.status === 'installing'
        ? 'Installing'
        : server.status === 'restoring_backup'
        ? 'Restoring'
        : '—';

    return (
        <CardWrapper to={`/server/${server.id}`} className={className} $status={stats?.status}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                {/* Server info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', minWidth: 0 }}>
                    <div style={{
                        width: '2.75rem',
                        height: '2.75rem',
                        borderRadius: '0.625rem',
                        background: 'hsl(228, 30%, 13%)',
                        border: '1px solid hsl(228, 25%, 22%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <FontAwesomeIcon icon={faServer} style={{ color: 'hsl(240, 60%, 65%)', fontSize: '1.1rem' }} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(220, 20%, 95%)', marginBottom: '0.125rem', lineHeight: 1.3 }}
                            className={'truncate'}>
                            {server.name}
                        </p>
                        {!!server.description && (
                            <p style={{ fontSize: '0.75rem', color: 'hsl(220, 13%, 54%)', lineHeight: 1.4, marginBottom: 0 }}
                                className={'line-clamp-1'}>
                                {server.description}
                            </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem' }}>
                            <FontAwesomeIcon icon={faEthernet} style={{ color: 'hsl(220, 13%, 45%)', fontSize: '0.7rem' }} />
                            <span style={{ fontSize: '0.7rem', color: 'hsl(220, 13%, 50%)', fontFamily: 'monospace' }}>
                                {server.allocations
                                    .filter((alloc) => alloc.isDefault)
                                    .map((allocation) => (
                                        <React.Fragment key={allocation.ip + allocation.port.toString()}>
                                            {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                        </React.Fragment>
                                    ))}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.7rem',
                    borderRadius: '999px',
                    background: statusColors.bg,
                    border: `1px solid ${statusColors.dot}30`,
                    whiteSpace: 'nowrap',
                }}>
                    <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: statusColors.dot,
                        boxShadow: `0 0 6px ${statusColors.dot}`,
                        flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: statusColors.dot, letterSpacing: '0.03em' }}>
                        {statusLabel}
                    </span>
                </div>
            </div>

            {/* Resource usage section */}
            <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
                {!stats || isSuspended ? (
                    isSuspended ? null : (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center' }}>
                            <Spinner size={'small'} />
                        </div>
                    )
                ) : (
                    <>
                        {/* CPU */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <FontAwesomeIcon icon={faMicrochip} style={{ fontSize: '0.65rem', color: alarms.cpu ? '#ef4444' : 'hsl(220, 13%, 50%)' }} />
                                    <span style={{ fontSize: '0.65rem', color: 'hsl(220, 13%, 50%)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>CPU</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: alarms.cpu ? '#ef4444' : 'hsl(220, 20%, 85%)' }}>
                                    {stats.cpuUsagePercent.toFixed(1)}%
                                </span>
                            </div>
                            <ResourceBar $percent={cpuPercent} $alarm={alarms.cpu} />
                            <p style={{ fontSize: '0.6rem', color: 'hsl(220, 13%, 42%)', marginTop: '0.2rem', marginBottom: 0 }}>of {cpuLimit}</p>
                        </div>
                        {/* Memory */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <FontAwesomeIcon icon={faMemory} style={{ fontSize: '0.65rem', color: alarms.memory ? '#ef4444' : 'hsl(220, 13%, 50%)' }} />
                                    <span style={{ fontSize: '0.65rem', color: 'hsl(220, 13%, 50%)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>RAM</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: alarms.memory ? '#ef4444' : 'hsl(220, 20%, 85%)' }}>
                                    {bytesToString(stats.memoryUsageInBytes)}
                                </span>
                            </div>
                            <ResourceBar $percent={memPercent} $alarm={alarms.memory} />
                            <p style={{ fontSize: '0.6rem', color: 'hsl(220, 13%, 42%)', marginTop: '0.2rem', marginBottom: 0 }}>of {memoryLimit}</p>
                        </div>
                        {/* Disk */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <FontAwesomeIcon icon={faHdd} style={{ fontSize: '0.65rem', color: alarms.disk ? '#ef4444' : 'hsl(220, 13%, 50%)' }} />
                                    <span style={{ fontSize: '0.65rem', color: 'hsl(220, 13%, 50%)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Disk</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: alarms.disk ? '#ef4444' : 'hsl(220, 20%, 85%)' }}>
                                    {bytesToString(stats.diskUsageInBytes)}
                                </span>
                            </div>
                            <ResourceBar $percent={diskPercent} $alarm={alarms.disk} />
                            <p style={{ fontSize: '0.6rem', color: 'hsl(220, 13%, 42%)', marginTop: '0.2rem', marginBottom: 0 }}>of {diskLimit}</p>
                        </div>
                    </>
                )}
            </div>
        </CardWrapper>
    );
}, isEqual);

export default ServerRow;
