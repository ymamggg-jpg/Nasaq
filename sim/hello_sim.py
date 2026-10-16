import shapely
import jupedsim as jps

geometry = shapely.Polygon([(0, 0), (20, 0), (20, 10), (0, 10)])
exit_polygon = shapely.Polygon([(19, 4), (20, 4), (20, 6), (19, 6)])

sim = jps.Simulation(model=jps.CollisionFreeSpeedModel(), geometry=geometry)
exit_id = sim.add_exit_stage(exit_polygon)
journey_id = sim.add_journey(jps.JourneyDescription([exit_id]))

for i in range(5):
    for j in range(4):
        sim.add_agent(
            jps.CollisionFreeSpeedModelAgentParameters(
                journey_id=journey_id,
                stage_id=exit_id,
                position=(2 + i, 3 + j),
                radius=0.2,
            )
        )

print("agents at start:", sim.agent_count())
while sim.agent_count() > 0 and sim.iteration_count() < 20000:
    sim.iterate()
print("agents left:", sim.agent_count())
print("seconds simulated:", round(sim.elapsed_time(), 1))