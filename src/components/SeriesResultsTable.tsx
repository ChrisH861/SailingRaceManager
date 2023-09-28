import React, { ChangeEvent, useState, useEffect } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table'
import Select from 'react-select';
import * as DB from '../components/apiMethods';

//not a db type, only used here
type SeriesResultsType = {
    [key: string]: any;
    Rank: number;
    Helm: string;
    Crew: string;
    Boat: BoatDataType;
    SailNumber: number;
    Total: number;
    Net: number;
    racePositions: number[];
}


const Text = ({ ...props }) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)

    return (
        <>
            <input type="text"
                id=''
                className=" text-center"
                defaultValue={value}
                key={value}
                disabled={true}
            />
        </>
    );
};

const Number = ({ ...props }: any) => {
    const initialValue = props.getValue()
    const [value, setValue] = React.useState(initialValue)
    return (
        <>
            <input type="number"
                id=''
                className="p-2 m-2 text-center w-full"
                defaultValue={Math.round(value)}
                key={value}
                disabled={true}
            />
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


const columnHelper = createColumnHelper<SeriesResultsType>()


const SeriesResultsTable = (props: any) => {
    let [seriesData, setSeriesData] = useState<SeriesDataType>(props.data)
    let clubId = props.clubId

    //calculate results table from data.
    let [data, setData] = useState<SeriesResultsType[]>([])

    const calcTable = () => {
        let tempresults: SeriesResultsType[] = []
        //collate results from same person.
        seriesData.races.forEach(race => {
            race.results.forEach(result => {
                //if new racer, add to tempresults
                if (tempresults.filter(function (t) {
                    return t.Helm == result.helm && t.boat == result.boat
                })) {
                    tempresults.push({
                        Rank: 0,
                        Helm: result.Helm,
                        Crew: result.Crew,
                        Boat: result.boat,
                        SailNumber: result.SailNumber,
                        Total: 0,
                        Net: 0,
                        racePositions: new Array<number>(seriesData.races.length)
                    })
                }
                //add result to tempresults
                const index = tempresults.findIndex((t) => t.Helm == result.Helm && t.Boat == result.boat)
                console.log(index, race.number)
                tempresults[index]?.racePositions.splice(race.number - 1, 0, result.Position)
            })
        });
        //fill dnc
        //calculate discards
        //calculate net

        console.log(tempresults)
        setData(tempresults)

    }

    React.useEffect(() => {
        console.log(seriesData)
        if (seriesData != undefined) {
            calcTable()
        }
    }, [seriesData])

    let columns = [
        columnHelper.accessor('Rank', {
            header: "Rank",
            cell: props => <Number {...props} />,
            enableSorting: true
        }),
        columnHelper.accessor("Helm", {
            header: "Helm",
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor("Crew", {
            header: "Crew",
            cell: props => <Text {...props} />,
            enableSorting: false
        }),
        columnHelper.accessor((data) => data.Boat.name, {
            header: "Class",
            id: "Class",
            cell: props => <Text {...props} clubId={clubId} />,
            enableSorting: false
        }),
        columnHelper.accessor((data) => data.SailNumber, {
            header: "Sail Number",
            cell: props => <Number {...props} />,
            enableSorting: false
        }),

    ];

    //add column for each race in series
    props.data.races.forEach((race: RaceDataType, index: number) => {
        console.log(race)
        console.log(data, index)
        const newColumn = columnHelper.accessor((data) => data.racePositions[index], {
            header: "R" + race.number.toString(),
            cell: props => <Number {...props} disabled={true} />,
            enableSorting: true
        })
        columns.push(newColumn)
    })

    const totalColumn = columnHelper.accessor('Total', {
        header: "Total",
        cell: props => <Number {...props} disabled={true} />,
        enableSorting: true
    })

    const netColumn = columnHelper.accessor('Net', {
        header: "Net",
        cell: props => <Number {...props} disabled={true} />,
        enableSorting: true
    })

    columns.push(totalColumn)
    columns.push(netColumn)

    const [sorting, setSorting] = useState<SortingState>([]);

    let table = useReactTable({
        data,
        columns,
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
        </div>
    )
}

export default SeriesResultsTable