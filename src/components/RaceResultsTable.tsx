import React, { ChangeEvent, useState, useEffect } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import Select from 'react-select';
import * as DB from './apiMethods';
import { start } from 'repl';

const Text = ({ ...props }) => {
    const value = props.getValue()

    return (
        <div className=' text-center'>
            {value}
        </div>
    );
};


const Laps = ({ ...props }: any) => {
    const value = props.getValue()

    return (
        <div className=' text-center'>
            {Math.round(value.number)}
        </div>
    );
};

const Time = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(new Date((initialValue - props.startTime) * 1000).toISOString().substring(11, 19))

    if (initialValue == -1) {
        return (
            <p className="p-2 m-2 text-center w-full">
                Retired
            </p>
        )
    } else {
        return (
            <>
                <input type="time"
                    id=''
                    className="p-2 m-2 text-center w-full"
                    value={value}
                    key={value}
                    step={"1"}
                    disabled
                />
            </>
        )
    }
};

const Class = ({ ...props }: any) => {
    let value = props.getValue()
    try {
        value = value.name
    } catch (error) {
        value = ""
    }

    return (
        <div className=' text-center'>
            {value}
        </div>
    );
};

const Edit = ({ ...props }: any) => {
    const onClick = () => {
        //show edit modal
        props.showEditModal(props.row.original.id)
    }
    return (
        <>
            <p className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
                onClick={onClick} >
                Edit
            </p>
        </>
    );
};

function Sort({ column, table }: { column: any, table: any }) {
    const firstValue = table
        .getPreFilteredRowModel()
        .flatRows[0]?.getValue(column.id);

    const columnFilterValue = column.getFilterValue();

    return (
        <div className='flex flex-row justify-center'>
            <p onClick={(e) => column.toggleSorting(true)} className='cursor-pointer'>
                ▲
            </p>
            <p onClick={(e) => column.toggleSorting(false)} className='cursor-pointer'>
                ▼
            </p>
        </div>
    )
}


const columnHelper = createColumnHelper<ResultsDataType>()


const RaceResultsTable = (props: any) => {
    let [data, setData] = useState<ResultsDataType[]>(props.data)
    let [startTime, setStartTime] = useState(props.startTime)
    let clubId = props.clubId
    let raceId = props.raceId

    const showEditModal = (id: any) => {
        props.showEditModal(id)
    }


    const createResult = async (id: any) => {
        var result = (await props.createResult(id))
        setData([...data, result])
    }

    const [sorting, setSorting] = useState<SortingState>([]);

    let table = useReactTable({
        data,
        columns: [
            columnHelper.accessor('Helm', {
                header: "Helm",
                cell: props => <Text {...props} />,
                enableSorting: false
            }),
            columnHelper.accessor('Crew', {
                header: "Crew",
                cell: props => <Text {...props} />,
                enableSorting: false
            }),
            columnHelper.accessor('boat', {
                header: "Class",
                id: "Class",
                size: 300,
                cell: props => <Class {...props} />,
                enableSorting: false
            }),
            columnHelper.accessor('SailNumber', {
                header: "Sail Number",
                cell: props => <Text {...props} />,
                enableSorting: false
            }),
            columnHelper.accessor('finishTime', {
                header: "Time",
                cell: props => <Time {...props} startTime={startTime} />,
                enableSorting: false
            }),
            columnHelper.accessor('lapTimes', {
                header: "Laps",
                cell: props => <Laps {...props} />,
                enableSorting: false
            }),
            columnHelper.accessor('CorrectedTime', {
                header: "Corrected Time",
                cell: props => <Text {...props} disabled={true} />,
                enableSorting: false
            }),
            columnHelper.accessor('Position', {
                header: "Position",
                cell: props => <Text {...props} disabled={true} />,
                enableSorting: true
            }),
            columnHelper.display({
                id: "Edit",
                cell: props => <Edit {...props} showEditModal={(id: string) => { showEditModal(id) }} />
            }),
        ],
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })
    return (
        <div key={props.data} className='block max-w-full'>
            <table className='w-full border-spacing-0'>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className='border-4 p-2' style={{ width: header.getSize() }}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    {header.column.getCanSort() ? (
                                        <div>
                                            <Sort column={header.column} table={table} />
                                        </div>
                                    ) : null}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className='border-4 p-2 w-1'>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className='w-full my-0 mx-auto'>
                <div className="p-6 w-3/4 m-auto">
                    <p onClick={() => createResult(raceId)} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                        Add Entry
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RaceResultsTable