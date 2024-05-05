import React from 'react';
import { ChartDonut, ChartThemeColor } from "@patternfly/react-charts";

const StudentChart = ({ data }) => {
    const pieData = data.map(item => ({
        x: item.title,
        y: item.users.length
    }));

    const legendData = pieData.map(item => ({
        name: `${item.x}: ${item.y}`
    }));

    return (
        <div style={{ height: '230px', width: '350px' }}>
            <ChartDonut
                ariaDesc="House user distribution"
                ariaTitle="House user distribution"
                constrainToVisibleArea
                data={pieData}
                labels={({ datum }) => `${datum.x}: ${datum.y}`}
                legendData={legendData}
                legendOrientation="vertical"
                legendPosition="right"
                name="house chart"
                padding={{
                    bottom: 20,
                    left: 20,
                    right: 140,
                    top: 20
                }}
                subTitle="Students"
                title={data.reduce((accumulator, item) => accumulator.concat(item.users), []).length}
                themeColor={ChartThemeColor.gold}
                width={350}
            />
        </div>
    );
};

export default StudentChart;
