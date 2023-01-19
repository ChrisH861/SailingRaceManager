import React, { useState } from 'react';
import dayjs from 'dayjs';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

type RaceDataType = {
    [key: string]: any,
    id: string,
    number: number,
    OOD: string,
    AOD: string,
    SO: string,
    ASO: string,
    results: any,
    Time: string,
    Type: string,
    seriesId: string
};

const columnHelper = createColumnHelper<RaceDataType>()

const columns = [
    columnHelper.accessor('number', {
        header: "number",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('Type', {
        header: "Type",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('Time', {
        id: "Number of Races",
        cell: info => dayjs(info.getValue(), "YYYY-MM-DD HH:mm").format('ddd D MMM YY [at] HH:mm'),
    }),
    columnHelper.accessor('OOD', {
        id: "Number to Count",
        cell: info => info.getValue(),
    }),
]


const SeriesTable = (props: any) => {
    var [data, setData] = useState(props.data)
    console.log(data)
    var table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })
    return (
        <div className="px-8" key={props.data}>
            <table>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className='border-4 p-2'>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className='border-4 p-2'>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default SeriesTable